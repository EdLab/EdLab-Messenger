import { Router } from 'express';
const router = Router()
import { urlencoded } from 'body-parser';
import getParam from 'express-get-param';

const { getController } = Utility

router.use(urlencoded({ extended: false }))

router.use('/templates',
  ((templateRouter = Router()) => {
    templateRouter.get('/', getParam('p', { parser: 'integer' }), getController('templates').list)
    templateRouter.get('/:id', getParam('id', { parser: 'integer' }), getController('templates').retrieve)
    templateRouter.put('/:id', getParam('id', { parser: 'integer' }), getController('templates').update)
    templateRouter.post('/', getController('templates').create)
    templateRouter.delete('/:id', getParam('id', { parser: 'integer' }), getController('templates').destroy)
  })
)

router.use('/emails',
  ((emailRouter = Router()) => {
    emailRouter.get('/', getParam('p', { parser: 'integer' }), getController('emails').list)
    emailRouter.get('/:id', getParam('id', { parser: 'integer' }), getController('emails').retrieve)
    emailRouter.get('/:id/messages', getParam('id', { parser: 'integer' }),
                    getParam('p', { parser: 'integer' }), getController('emails').messages)
    emailRouter.put('/:id', getParam('id', { parser: 'integer' }), getController('emails').update)
    emailRouter.post('/', getController('emails').create)
    emailRouter.delete('/:id', getParam('id', { parser: 'integer' }), getController('emails').destroy)
  })
)

export default router
