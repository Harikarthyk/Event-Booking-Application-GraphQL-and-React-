const express = require("express");
const {graphqlHTTP} = require("express-graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");
const User = require("./models/user");

//Parse string to object
const {buildSchema} = require("graphql");
const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ortfn.mongodb.net/EventBookDB?retryWrites=true&w=majority`;

mongoose
	.connect(mongoURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => console.log(`MongoDB Connected`))
	.catch((error) => console.log(error));

const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/", (req, res) => {
	res.send("Server is working fine ");
});

app.use(
	"/graphql",
	graphqlHTTP({
		schema: buildSchema(`
        type User {
			_id : ID , 
			email : String! ,
			password : String! ,
			createdEvents : [Event!] 
		}
		
		input UserInput {
			email : String! ,
			password : String! ,	
		}

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
			createUser(userInput : UserInput) : User 
		}
        schema {
            query : RootQuery 
            mutation : RootMutation
        }
    `),
		rootValue: {
			events: async () => {
				try {
					let events = await Event.find({isActive: true, isDeleted: false});
					return events;
				} catch (error) {
					console.log(error);
					throw error;
				}
			},
			createEvent: async ({eventInput}) => {
				try {
					let newEvent = new Event({
						title: eventInput.title,
						description: eventInput.description,
						price: eventInput.price,
						date: new Date(),
						creator: "",
					});
					let response = await newEvent.save();

					return response;
				} catch (error) {
					console.log(error);
					throw error;
				}
			},
			createUser: async ({userInput}) => {
				try {
					let preUser = await User.findOne({email: userInput.email});
					if (preUser) {
						throw new Error("User already Exists");
					}
					let newUser = new User({
						email: userInput.email,
						password: userInput.password,
					});
					let response = await newUser.save();
					response.password = "";
					return response;
				} catch (error) {
					console.log(error);
					throw error;
				}
			},
		},

		graphiql: true,
	}),
);

const PORT = 5050;

app.listen(PORT, () => console.log(`Server is running at ${PORT} PORT`));
