const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const userWeights = [
  { value: "85.5" },
  { value: "87" },
  { value: "63" },
  { value: "83.8" },
];

const userWeightType = new GraphQLObjectType({
  name: "weight",
  fields: () => ({
    value: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "GET_USER_WEIGHTS",
  fields: () => ({
    userWeights: {
      type: new GraphQLList(userWeightType),
      resolve: () => userWeights,
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

module.exports = { schema };
