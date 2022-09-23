const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { schema } = require("./schema/schema");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
);

app.listen(PORT, () => {
  return console.log(`Listening on port: ${PORT}`);
});
