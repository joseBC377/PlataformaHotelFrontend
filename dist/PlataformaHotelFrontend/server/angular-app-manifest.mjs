
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/nombre-repo/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/nombre-repo"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/intranet"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/usuario"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/pago"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/reserva"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/contacto"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/habitacion"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/servicio"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/categoria-habitacion"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/admin/resena"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/login"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/nosotros"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/habitaciones"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/servicios"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/reservas"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/contactos"
  },
  {
    "renderMode": 2,
    "route": "/nombre-repo/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 28039, hash: '3a7ccb2d4686f1469dc6b65d4835cda3582c6013c25bbaba8b2985258e7bd48c', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17324, hash: '1273d7076b9547fc648d0151654fe9f0795bc690cd76af5160979e5bf3ab1d50', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 143474, hash: 'dd1ae5b162c7774004a7dd81c1404dfaebab6a2d1c35bdba1b7bf953d3c92048', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'admin/reserva/index.html': {size: 60241, hash: 'a93b90e49a49d932bfb45168f76c297d5206d8865628fe767d33f131a9ad5305', text: () => import('./assets-chunks/admin_reserva_index_html.mjs').then(m => m.default)},
    'admin/index.html': {size: 60241, hash: 'a93b90e49a49d932bfb45168f76c297d5206d8865628fe767d33f131a9ad5305', text: () => import('./assets-chunks/admin_index_html.mjs').then(m => m.default)},
    'admin/resena/index.html': {size: 60249, hash: 'a496aeea5ab500ee2c5e24ef5facc0bf11c1bcfec1b891740babcb7ef83f0b73', text: () => import('./assets-chunks/admin_resena_index_html.mjs').then(m => m.default)},
    'contactos/index.html': {size: 60249, hash: 'a496aeea5ab500ee2c5e24ef5facc0bf11c1bcfec1b891740babcb7ef83f0b73', text: () => import('./assets-chunks/contactos_index_html.mjs').then(m => m.default)},
    'admin/contacto/index.html': {size: 60241, hash: 'a93b90e49a49d932bfb45168f76c297d5206d8865628fe767d33f131a9ad5305', text: () => import('./assets-chunks/admin_contacto_index_html.mjs').then(m => m.default)},
    'admin/usuario/index.html': {size: 60249, hash: 'a496aeea5ab500ee2c5e24ef5facc0bf11c1bcfec1b891740babcb7ef83f0b73', text: () => import('./assets-chunks/admin_usuario_index_html.mjs').then(m => m.default)},
    'admin/habitacion/index.html': {size: 60241, hash: 'a93b90e49a49d932bfb45168f76c297d5206d8865628fe767d33f131a9ad5305', text: () => import('./assets-chunks/admin_habitacion_index_html.mjs').then(m => m.default)},
    'admin/categoria-habitacion/index.html': {size: 60249, hash: 'a496aeea5ab500ee2c5e24ef5facc0bf11c1bcfec1b891740babcb7ef83f0b73', text: () => import('./assets-chunks/admin_categoria-habitacion_index_html.mjs').then(m => m.default)},
    'admin/intranet/index.html': {size: 60249, hash: 'a496aeea5ab500ee2c5e24ef5facc0bf11c1bcfec1b891740babcb7ef83f0b73', text: () => import('./assets-chunks/admin_intranet_index_html.mjs').then(m => m.default)},
    'admin/servicio/index.html': {size: 60249, hash: 'a496aeea5ab500ee2c5e24ef5facc0bf11c1bcfec1b891740babcb7ef83f0b73', text: () => import('./assets-chunks/admin_servicio_index_html.mjs').then(m => m.default)},
    'reservas/index.html': {size: 52464, hash: '24caa32a23b6c8d4ebd04357e13092b2ec08109531e695e442fa14ae3227fa44', text: () => import('./assets-chunks/reservas_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 60249, hash: 'a496aeea5ab500ee2c5e24ef5facc0bf11c1bcfec1b891740babcb7ef83f0b73', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'admin/pago/index.html': {size: 60249, hash: 'a496aeea5ab500ee2c5e24ef5facc0bf11c1bcfec1b891740babcb7ef83f0b73', text: () => import('./assets-chunks/admin_pago_index_html.mjs').then(m => m.default)},
    'servicios/index.html': {size: 52840, hash: 'e9854faa0dba18715569b022f626d3c983e4b3b7aeb372086c8ba16689bc4730', text: () => import('./assets-chunks/servicios_index_html.mjs').then(m => m.default)},
    'nosotros/index.html': {size: 53306, hash: 'adc5f42b9a7a8e0b345c496d52f5db132abf87f195c3788c72e4b0cedec891d7', text: () => import('./assets-chunks/nosotros_index_html.mjs').then(m => m.default)},
    'habitaciones/index.html': {size: 55945, hash: 'd18820c6c52dd7a82b82ec2906af5dace85762fe32169af0e89e433b5fef619c', text: () => import('./assets-chunks/habitaciones_index_html.mjs').then(m => m.default)},
    'styles-PLPNEZQA.css': {size: 237725, hash: 'liaTWf0HtvA', text: () => import('./assets-chunks/styles-PLPNEZQA_css.mjs').then(m => m.default)}
  },
};
