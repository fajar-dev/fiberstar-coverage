/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const CoveragesController = () => import('#controllers/coverages_controller')
import router from '@adonisjs/core/services/router'

router.post('/coverage', [CoveragesController, 'index'])
