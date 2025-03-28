const { createClient } = require("redis");
const client = createClient({
  url: "redis://default:eM3e7wSoyGG3b3ZbFaNYEYAuz3EUYp58@redis-11119.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com:11119",
});
client.on("error", (error) => console.log("Redis client error", error));
const connectionRedis = () => {
  return client
    .connect()
    .then(() => console.log("Redis connected!"))
    .catch((error) => console.log(error));
};
module.exports = {
  connectionRedis,
  redisClient: client,
};
