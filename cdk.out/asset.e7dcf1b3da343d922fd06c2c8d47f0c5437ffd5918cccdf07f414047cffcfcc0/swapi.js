exports.main    = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from the Swapi service!" }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };
}