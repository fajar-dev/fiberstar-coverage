import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { readFileSync } from 'node:fs'
import db from '@adonisjs/lucid/services/db'

export default class ImportCsv extends BaseCommand {
  static commandName = 'import:csv'
  static description = 'Import data dari CSV Homepass Nusaselecta ke tabel coverages'
  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Path ke file CSV' })
  declare filePath: string

  /**
   * Parse satu baris CSV yang mendukung quoted fields
   */
  private parseCsvLine(line: string): string[] {
    const fields: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    fields.push(current.trim())
    return fields
  }

  async run() {
    this.logger.info(`Membaca file: ${this.filePath}`)

    let content: string
    try {
      content = readFileSync(this.filePath, 'utf-8')
    } catch {
      this.logger.error(`File tidak ditemukan: ${this.filePath}`)
      return
    }

    const lines = content.split('\n').filter((line) => line.trim().length > 0)

    if (lines.length < 2) {
      this.logger.error('File CSV kosong atau hanya berisi header')
      return
    }

    const dataLines = lines.slice(1)
    const total = dataLines.length
    this.logger.info(`Total baris data: ${total}`)

    // Header mapping:
    // 0: RFS ID          → homepass_id
    // 1: Cluster          → fallback address
    // 2: District         → fallback address
    // 4: ID Customer IS   → customer_id (null jika kosong)
    // 9: WO ID            → name
    // 23: Koordinat       → coordinate (lat,lng)
    // 27: Installation Address → address

    // ===== STEP 1: Parse semua baris & kumpulkan homepass_ids =====
    this.logger.info('Parsing CSV...')

    const rows: {
      homepassId: string | null
      customerId: string | null
      name: string | null
      address: string | null
      coordinate: string
      type: string
    }[] = []

    const homepassIds = new Set<string>()
    let skipped = 0

    for (const line of dataLines) {
      const fields = this.parseCsvLine(line.replace(/\r$/, ''))

      const rfsId = fields[0] || null
      const cluster = fields[1] || ''
      const district = fields[2] || ''
      const customerIs = fields[4]?.trim() || null
      const woId = fields[9] || null
      const koordinat = fields[23] || ''
      const installAddress = fields[27] || ''

      // Skip jika tidak ada koordinat
      if (!koordinat) {
        skipped++
        continue
      }

      // Parse coordinate: CSV = "lat,lng" → DB = "lat, lng"
      const coordParts = koordinat.split(',').map((p: string) => p.trim())
      if (coordParts.length !== 2 || !coordParts[0] || !coordParts[1]) {
        skipped++
        continue
      }

      const lat = parseFloat(coordParts[0])
      const lng = parseFloat(coordParts[1])
      if (isNaN(lat) || isNaN(lng)) {
        skipped++
        continue
      }

      const coordinate = `${coordParts[0]}, ${coordParts[1]}`
      const address = installAddress || [cluster, district].filter(Boolean).join(', ') || null
      const type = customerIs ? 'IForte Customer' : 'IForte'

      if (rfsId) {
        homepassIds.add(rfsId)
      }

      rows.push({
        homepassId: rfsId,
        customerId: customerIs,
        name: woId,
        address,
        coordinate,
        type,
      })
    }

    this.logger.info(`Parsed: ${rows.length} valid, ${skipped} skipped`)
    this.logger.info(`Unique homepass_id: ${homepassIds.size}`)

    // ===== STEP 2: Hapus data lama berdasarkan homepass_id =====
    this.logger.info('Menghapus data lama berdasarkan homepass_id...')

    const idsArray = Array.from(homepassIds)
    const DELETE_BATCH = 1000
    let deleted = 0

    for (let i = 0; i < idsArray.length; i += DELETE_BATCH) {
      const batch = idsArray.slice(i, i + DELETE_BATCH)
      const placeholders = batch.map(() => '?').join(', ')

      const result = await db.rawQuery(
        `DELETE FROM coverages WHERE homepass_id IN (${placeholders})`,
        batch
      )
      deleted += (result as any).rowCount ?? 0
    }

    this.logger.info(`Dihapus: ${deleted} baris lama`)

    // ===== STEP 3: Insert data baru (batch INSERT) =====
    this.logger.info('Menyisipkan data baru...')

    const INSERT_BATCH = 500
    let inserted = 0

    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const batch = rows.slice(i, i + INSERT_BATCH)
      const values: string[] = []
      const params: any[] = []

      for (const row of batch) {
        values.push('(?, ?, ?, ?, ?, ?, ?, ?)')
        params.push(
          row.homepassId,
          null,            // service_id
          null,            // splitter_id
          row.customerId,
          row.name,
          row.address,
          row.coordinate,
          row.type
        )
      }

      try {
        const result = await db.rawQuery(
          `INSERT INTO coverages (homepass_id, service_id, splitter_id, customer_id, name, address, coordinate, type)
           VALUES ${values.join(', ')}`,
          params
        )
        inserted += (result as any).rowCount ?? 0
      } catch (error: any) {
        this.logger.error(`Error batch ${Math.floor(i / INSERT_BATCH) + 1}: ${error.message}`)
      }

      // Progress setiap batch
      const progress = Math.min(i + INSERT_BATCH, rows.length)
      if (progress % 5000 === 0 || progress === rows.length) {
        this.logger.info(`Insert progress: ${progress}/${rows.length}`)
      }
    }

    this.logger.success(`Import selesai!`)
    this.logger.info(`  Deleted  : ${deleted}`)
    this.logger.info(`  Inserted : ${inserted}`)
    this.logger.info(`  Skipped  : ${skipped}`)
    this.logger.info(`  Total    : ${total}`)
  }
}
