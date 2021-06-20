const express = require("express");
const {graphqlHTTP} = require("express-graphql");

//Parse string to object
const {buildSchema} = require("graphql");

const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/", (req, res) => {
	res.send("Server is working fine ");
});

let events = [];

app.use(
	"/graphql",
	graphqlHTTP({
		schema: buildSchema(`
        type Event {
            _id : ID ,
            title : String! ,
            description : String! ,
            price : Float! ,
            date : String! ,
        }
        input EventInput {
            title : String! ,
            description : String! ,
            price : Float! ,
            date : String! ,
        }

        type RootQuery {
            events : [Event!]! 
        }
        type RootMutation {
            createEvent(eventInput : EventInput) : Event
        }
        schema {
            query : RootQuery 
            mutation : RootMutation
        }
    `),
		rootValue: {
			events: () => events,
			createEvent: ({eventInput}) => {
				    const newEvent = {
					_id: Math.random().toFixed() + new Date().toISOString(),
					title: eventInput.title,
					description: eventInput.description,
					price: eventInput.price,
					date: eventInput.date,
				};
				events.push(newEvent);
				console.log(newEvent);
				return newEvent;
			},
		},
		graphiql: true,
	}),
);

const PORT = 5050;

app.listen(PORT, () => console.log(`Server is running at ${PORT} PORT`));
