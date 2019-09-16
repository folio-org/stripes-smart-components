export default function (server) {
  server.post('location-units/institutions', {
    'errors': [{
      'message': 'Cannot create entity; name is not unique',
      'code': 'name.duplicate',
      'parameters': [{
        'key': 'fieldLabel',
        'value': 'name'
      }]
    }]
  }, 400);
}
