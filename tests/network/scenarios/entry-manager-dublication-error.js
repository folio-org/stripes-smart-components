export default function (server) {
  server.post('lost-item-fees-policy', {
    'errors': [{
      'message': 'Cannot create entity; name is not unique',
      'code': 'name.duplicate'
    }]
  }, 422);
}
