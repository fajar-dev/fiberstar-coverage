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
const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router
  .group(() => {
    router.post('/list', [CoveragesController, 'index'])
    router.get('/coverage', [CoveragesController, 'find'])
    router.get('/export', [CoveragesController, 'export'])
    router.get('/additional/type', [AdditionalsController, 'typeEnum'])
    router.group(() => {
      router.post('/login', [AuthController, 'login'])
      router.get('/me', [AuthController, 'me']).use(middleware.auth())
      router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    })
    .prefix('/auth')
  })
  .prefix('/api')
