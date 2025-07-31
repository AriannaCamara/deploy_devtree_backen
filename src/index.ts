import colors from 'colors'
import server from './server'

const port = process.env.PORT || 4000

server.listen(port, () => {
    console.log(colors.bgMagenta.magenta.italic('servidor funcionando en el puerto:'), port)
})