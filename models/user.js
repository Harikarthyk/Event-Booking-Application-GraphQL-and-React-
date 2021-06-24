const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		createdEvents: [{type: mongoose.Schema.Types.ObjectId, ref: "Event"}],
	},
	{timestamps: true},
);

userSchema.pre("save", function (next) {
	const user = this;
	if (user.password) {
		// Hashing the Password .
		bcrypt.hash(user.password, 10, function (err, hash) {
			if (err) {
				return res.status(400).json({
					error: true,
					message: `Error in creating the Account`,
				});
			}
			user.password = hash;
			next();
		});
	} else next();
});

module.exports = mongoose.model("User", userSchema);
