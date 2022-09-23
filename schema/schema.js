const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "heybye",
    fields: () => ({
      message: { type: GraphQLString, resolve: () => "heybye message" },
      GoodBook: { type: GraphQLBoolean, resolve: () => true },
      author: { type: GraphQLString, resolve: () => "hakim hamaili" },
    }),
  }),
});

module.exports = { schema };
