export default function (server) {
  server.post('location-units/institutions', {
    'errors': [{
      'message': 'test',
      'code': '-1',
      'parameters': [{
        'key': 'test',
        'value': 'test'
      }]
    }]
  }, 422);
}
