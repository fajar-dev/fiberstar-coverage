/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const CoveragesController = () => import('#controllers/coverages_controller')
const AdditionalsController = () => import('#controllers/additionals_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('/list', [CoveragesController, 'index'])
    router.get('/coverage', [CoveragesController, 'find'])
    router.get('/additional/type', [AdditionalsController, 'typeEnum'])
  })
  .prefix('/api')
