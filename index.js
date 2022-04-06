const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, LoggerLevel } = require('mongodb');
// graphql
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull } = require('graphql');

// middleware 
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://learning-database:n4Jecc0URZJL35YK@cluster0.icikx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// app.get('/', (req, res) => {

//     res.send('Running my CRUD server')
// })

const myData = [

    {
        "id": "826704",
        "title": "Agile.Web.Development.with.Rails.4th.Edition",
        "author": "the pragmatic programmers 1",
    },
    {
        "id": "826704",
        "title": "Agile.Web.Development.with.Rails.4th.Edition",
        "author": "the pragmatic programmers 2",
    },
    {
        "id": "826704",
        "title": "Agile.Web.Development.with.Rails.4th.Edition",
        "author": "the pragmatic programmers 3",
    },
    {
        "id": "826704",
        "title": "Agile.Web.Development.with.Rails.4th.Edition",
        "author": "the pragmatic programmers 4",
    },
]



async function run() {
    try {
        await client.connect();
        const database = client.db('group_info');
        const usersCollection = database.collection('user');
        const userPostCollection = database.collection('userPost');
        console.log('ready')
        //user
        const postClient = new GraphQLObjectType({
            name: 'Client',
            description: 'This represets a books by an author',
            fields: () => ({
                _id: { type: GraphQLString },
                displayName: { type: GraphQLString },
            })
        })
        const postQuery = new GraphQLObjectType({
            name: 'Post',
            description: 'This represets a books by an author',
            fields: () => ({
                _id: { type: GraphQLString },
                postInfo: { type: GraphQLString },
                codeType: { type: GraphQLString },
                client: { type: GraphQLList(postClient), resolve: (post) => [post.client] }
            })
        })
        const userQuery = new GraphQLObjectType({
            name: 'Book',
            description: 'This represets a books by an author',
            fields: () => ({
                _id: { type: GraphQLString },
                displayName: { type: GraphQLString },
                email: { type: GraphQLString },
                posts: {
                    type: GraphQLList(postQuery),
                    resolve: async (user) => {
                        return await userPostCollection.find({ "client.email": user.email }).toArray()
                    }
                }
            })
        })
        const RootQueryType = new GraphQLObjectType({
            name: 'Query',
            description: 'Root query ',
            fields: () => ({
                books: {
                    type: GraphQLList(userQuery),
                    resolve: async () => await usersCollection.find({}).toArray()
                }
            })
        })
        const schema = new GraphQLSchema({
            query: RootQueryType
        });



        app.use('/graphql', graphqlHTTP({
            schema: schema,
            graphiql: true,
        }));


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`listening at ${port}`)
})

