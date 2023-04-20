import { Telegraf, Markup } from "telegraf";
import fs from "fs";
const BOT_TOKEN = "6131107887:AAFbi7kFwKlcf2yU3OwYeyRO8q0LlSHf4v4";
const Admin_IDs = [928572639, 2101480100];
const bot = new Telegraf(BOT_TOKEN);
let deletingbtn = false;
bot.use(Telegraf.log());


function getMainMenu() {
	try {
		const data = fs.readFileSync('./Data/Main_menu.json', 'utf8');
		const menu = JSON.parse(data);
		return menu.menu.map(item => item.name);
	} catch (err) {
		console.log(err);
		return null;
	}
}

//main menu
bot.command(['start', 'help', 'goToMainMenu'], async (ctx) => {
	await ShowMainMenu(ctx)
})

bot.action("addBtn", async (ctx) => {
	// Retrieve the category from the stored context
	ctx.reply(`Please send me a chose btn name`);
	bot.on('message', createBtn)
})

bot.action("deleteBtn", async (ctx) => {
	deletingbtn = true
	// Retrieve the category from the stored context
	const fileData = fs.readFileSync('./Data/Main_menu.json', 'utf-8');
	const data = JSON.parse(fileData).menu;
	const menuKeyboard = Markup.keyboard(data.map(item => item.name), {
		wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2,
	});
	ctx.reply('Please select the button you want to delete:', menuKeyboard);
	// bot.on('message',deleteBtn)

});


async function ShowMainMenu(ctx) {
	let Main_menu = getMainMenu()
	ctx.reply(
		"Hi!\nI'm Psyco bot!\n Powered by salah.",
		Markup.keyboard(Main_menu, {
			wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2,
		}),
	);
	if (!Admin_IDs.includes(ctx.from.id)) {

	} else {
		ctx.reply(`hello admin can add new button to category content`, {
			reply_markup: {
				inline_keyboard: [
					[{ text: 'AddBtn', callback_data: 'addBtn' }],
					[{ text: 'DeleteBtn', callback_data: 'deleteBtn' }],
				],
			},
		});
	}
}
async function deleteBtn(ctx) {
	deletingbtn = false;
	const btnName = ctx.message.text;
	console.log(`Attempting to delete button "${btnName}"`);
	try {
		// Load the menu data from the file
		const fileData = fs.readFileSync('./Data/Main_menu.json', 'utf-8');
		const menuData = JSON.parse(fileData).menu;

		// Remove the button from the menu data array
		const index = menuData.findIndex((btn) => btn.name === btnName);
		console.log("am here", index)
		if (index > -1) {
			try {

				menuData.splice(index, 1);
				// Save the updated menu data to the file
				fs.writeFileSync('./Data/Main_menu.json', JSON.stringify({ menu: menuData }));
				// Respond to the user
				console.log(`Button "${btnName}" deleted successfully`);

				await ctx.reply(`The button "${btnName}" has been removed from the main menu.`);
				ShowMainMenu(ctx);
			} catch (e) { console.log(e) }
		} else {
			console.log(`Button "${btnName}" not found in menu`);
			await ctx.reply(`Error: The button "${btnName}" was not found in the main menu.`);
		}
	} catch (err) {
		console.log(`Error deleting button "${btnName}": ${err.message}`);
		await ctx.reply(`Error deleting button "${btnName}": ${err.message}`);
	}
}


async function createBtn(ctx) {
	const btnName = ctx.message.text;
	console.log(btnName);

	try {
		// Load the menu data from the file
		const fileData = fs.readFileSync('./Data/Main_menu.json', 'utf-8');
		const menuData = JSON.parse(fileData).menu;

		// Add the new button to the menu data
		menuData.push({
			name: btnName,
			action: btnName.toUpperCase().replace(/ /g, '_')
		});

		// Save the updated menu data to the file
		fs.writeFileSync('./Data/Main_menu.json', JSON.stringify({ menu: menuData }));

		// Respond to the user
		await ctx.reply(`The button "${btnName}" has been added to the main menu.`);
		ShowMainMenu(ctx)
	} catch (err) {
		console.log(err);
		await ctx.reply(`Error: ${err.message}`);
	}
}


let ctxForAddFile; // declare a variable to store the context
let ctxForDeletingFile; // declare a variable to store the context

let Main_menu = getMainMenu()
bot.hears(Main_menu, (ctx) => {
	if (deletingbtn) {
		console.log("you are deleteing btn", ctx.message.text)
		deleteBtn(ctx)
	} else {
		if (!Admin_IDs.includes(ctx.from.id)) {
			// if it's not an admin, send a simple message
			ctx.reply(`You clicked on: ${ctx.message.text}`);
			sendDocumentsByCategory(ctx, bot);
		} else {
			sendDocumentsByCategory(ctx, bot);
			// if it's an admin send a message with inline keyboard options
			ctx.reply(`Hello admin! You clicked on: ${ctx.message.text}`, {
				reply_markup: {
					inline_keyboard: [
						[{ text: 'Add', callback_data: 'addfile' }],
						[{ text: 'Delete', callback_data: 'deletefile' }],
					],
				},
			});

			ctxForAddFile = ctx; // store the context in the variable
			ctxForDeletingFile = ctx; // store the context in the variable
		}

	}

});



bot.action("addfile", async (ctx) => {
	// Retrieve the category from the stored context
	const category = ctxForAddFile.message.text;
	ctx.reply(`Please send me a ${category} file or text`);
	// Listen for the user to send the file
	bot.on('document', handleDocument);
	bot.on('photo', handlePhoto)
	bot.on('video', handleVideo)
	bot.on('text', handleText)
})

bot.action("deletefile", async (ctx) => {
	let fileNametoDeleteC = ctxForDeletingFile.message.text
	console.log("category of file", fileNametoDeleteC)

	const content = fs.readFileSync("./Data/content.json", "utf-8");
	let data = JSON.parse(content);
	const documents = JSON.parse(content).documents;
	const fileNames = documents.filter(doc => doc.category === fileNametoDeleteC).map(doc => doc.file_name);

	let Markup_inlineKey = fileNames.map((fileName) => {
		return [{ text: fileName, callback_data: "deleteChosenfile" }]
	})
	console.log(Markup_inlineKey)
	ctx.reply("Choose file to delete:", {
		reply_markup: {
			inline_keyboard: Markup_inlineKey
		}
	});

	// what i do here to delete from content by chosen name

});

bot.action("deleteChosenfile", (ctx2) => {
	const content = fs.readFileSync("./Data/content.json", "utf-8");
	let data = JSON.parse(content);

	const fileIdToDelete = ctx2.callbackQuery.message.reply_markup.inline_keyboard;
	console.log('File to delete:', fileIdToDelete);

	fs.writeFileSync("./Data/content.json", JSON.stringify(data));
	ctx2.answerCbQuery(`File  tt  has been deleted`);
	console.log("deleted")
});



async function handlePhoto(ctx) {

	const category = ctxForAddFile.message.text;
	try {
		// Get the file information
		const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
		const fileName = `photo_${fileId}`;
		const fileType = 'photo';

		let data = [];
		try {
			const fileData = fs.readFileSync('./Data/content.json', 'utf-8');
			data = JSON.parse(fileData).documents; // assuming the data is stored under the "documents" key
		} catch (err) {
			console.log(err);
		}

		// Add the new file to the data
		data.push({
			category,
			file_id: fileId,
			file_name: fileName,
			file_type: fileType,
		});

		// Write the updated data back to the file
		fs.writeFileSync('./Data/content.json', JSON.stringify({ documents: data }));
		console.log(data);
		await ctx.reply("photo successfully added.");
	} catch (err) {
		console.log(err);
		await ctx.reply("There was an error while adding the file.");
	}

}
async function handleVideo(ctx) {

	const category = ctxForAddFile.message.text;
	try {
		// Get the file information
		const fileId = ctx.message.video.file_id;
		const fileName = `video_${fileId}`;
		const fileType = 'video';

		let data = [];
		try {
			const fileData = fs.readFileSync('./Data/content.json', 'utf-8');
			data = JSON.parse(fileData).documents; // assuming the data is stored under the "documents" key
		} catch (err) {
			console.log(err);
		}

		// Add the new file to the data
		data.push({
			category,
			file_id: fileId,
			file_name: fileName,
			file_type: fileType,
		});

		// Write the updated data back to the file
		fs.writeFileSync('./Data/content.json', JSON.stringify({ documents: data }));
		console.log(data);
		await ctx.reply("video successfully added.");
	} catch (err) {
		console.log(err);
		await ctx.reply("There was an error while adding the file.");
	}

}

async function handleDocument(ctx) {

	const category = ctxForAddFile.message.text;
	try {
		// Get the file information
		const fileId = ctx.message.document.file_id;
		const fileName = ctx.message.document.file_name;
		const fileType = 'document';

		let data = [];
		try {
			const fileData = fs.readFileSync('./Data/content.json', 'utf-8');
			data = JSON.parse(fileData).documents; // assuming the data is stored under the "documents" key
		} catch (err) {
			console.log(err);
		}
		// Add the new file to the data
		data.push({
			category,
			file_id: fileId,
			file_name: fileName,
			file_type: fileType,
		});

		// Save the updated data to the file
		fs.writeFileSync('./Data/content.json', JSON.stringify({ documents: data }));

		// Respond to the user
		await ctx.reply(`The document "${fileName}" has been saved.`);

	} catch (err) {
		console.log(err);
		await ctx.reply(`Error: ${err.message}`);
	}
}

async function handleText(ctx) {

	const category = ctxForAddFile.message.text;
	try {
		// Get the file information
		const fileId = ctx.message.message_id;
		const fileName = ctx.message.text;
		const fileType = 'text';

		let data = [];
		try {
			const fileData = fs.readFileSync('./Data/content.json', 'utf-8');
			data = JSON.parse(fileData).documents; // assuming the data is stored under the "documents" key
		} catch (err) {
			console.log(err);
		}
		// Add the new file to the data
		data.push({
			category,
			file_id: fileId,
			file_name: fileName,
			file_type: fileType,
		});

		// Save the updated data to the file
		fs.writeFileSync('./Data/content.json', JSON.stringify({ documents: data }));

		// Respond to the user
		await ctx.reply(`This text "${fileName}" has been saved.`);

	} catch (err) {
		console.log(err);
		await ctx.reply(`Error: ${err.message}`);
	}
}

async function sendDocumentsByCategory(ctx, bot) {
	const category = ctx.message.text;
	console.log(category);
	if (category) {
		const data = JSON.parse(fs.readFileSync('./Data/content.json', 'utf-8'));
		//docuemnt here mean all the contents sorry for that
		const documents = data.documents.filter((doc) => doc.category === category);
		const media = documents
			.map((doc) => {
				console.log(doc.file_type);
				if (doc.file_type === 'photo') {
					return {
						type: 'photo',
						media: doc.file_id,
						caption: doc.file_name,
					};
				} else if (doc.file_type === 'document') {
					return {
						type: 'document',
						media: doc.file_id,
						caption: doc.file_name,
					};

				} else if (doc.file_type === 'video') {
					return {
						type: 'video',
						media: doc.file_id,
						caption: doc.file_name,
					};

				} else if (doc.file_type === 'text') {
					return {
						type: 'text',
						media: doc.file_id,
						caption: doc.file_name,
					};

				}
				else {
					return null;
				}
			})
			.filter((media) => media !== null);

		await media.map((ele) => {
			if (ele.type === 'document' || ele.type === 'photo' || ele.type === 'video') {
				bot.telegram.sendMediaGroup(ctx.chat.id, [ele])
				console.log("sending media group")
			} else {
				bot.telegram.sendMessage(ctx.chat.id, ele.caption)
				console.log("sending text")
			}
		})
	}
}

bot.launch();























bot.command("custom", async ctx => {
	return await ctx.reply(
		"Custom buttons keyboard",
		Markup.keyboard([
			["🔍 Search", "😎 Popular"], // Row1 with 2 buttons
			["☸ Setting", "📞 Feedback"], // Row2 with 2 buttons
			["📢 Ads", "⭐️ Rate us", "👥 Share"], // Row3 with 3 buttons
		])
			.oneTime()
			.resize(),
	);
});




//add or delete
bot.command("inline", ctx => {
	return ctx.reply("<b>Coke</b> or <i>Pepsi?</i>", {
		parse_mode: "HTML",
		...Markup.inlineKeyboard([
			Markup.button.callback("Coke", "Coke"),
			Markup.button.callback("Pepsi", "Pepsi"),
		]),
	});
});

bot.command("random", ctx => {
	return ctx.reply(
		"random example",
		Markup.inlineKeyboard([
			Markup.button.callback("Coke", "Coke"),
			Markup.button.callback("Dr Pepper", "Dr Pepper", Math.random() > 0.5),
			Markup.button.callback("Pepsi", "Pepsi"),
		]),
	);
});

bot.command("caption", ctx => {
	return ctx.replyWithPhoto(
		{ url: "https://picsum.photos/200/300/?random" },
		{
			caption: "Caption",
			parse_mode: "Markdown",
			...Markup.inlineKeyboard([
				Markup.button.callback("Plain", "plain"),
				Markup.button.callback("Italic", "italic"),
			]),
		},
	);
});

bot.hears(/\/wrap (\d+)/, ctx => {
	return ctx.reply(
		"Keyboard wrap",
		Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
			columns: parseInt(ctx.match[1]),
		}),
	);
});

bot.action("Dr Pepper", (ctx, next) => {
	return ctx.reply("👍").then(() => next());
});

bot.action("plain", async ctx => {
	await ctx.answerCbQuery();
	await ctx.editMessageCaption(
		"Caption",
		Markup.inlineKeyboard([
			Markup.button.callback("Plain", "plain"),
			Markup.button.callback("Italic", "italic"),
		]),
	);
});

bot.action("italic", async ctx => {
	await ctx.answerCbQuery();
	await ctx.editMessageCaption("_Caption_", {
		parse_mode: "Markdown",
		...Markup.inlineKeyboard([
			Markup.button.callback("Plain", "plain"),
			Markup.button.callback("* Italic *", "italic"),
		]),
	});
});

bot.action(/.+/, ctx => {
	return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
});

bot.hears("Search", ctx => ctx.reply("Yay!"));

bot.command("special", ctx => {
	return ctx.reply(
		"Special buttons keyboard",
		Markup.keyboard([
			Markup.button.contactRequest("Send contact"),
			Markup.button.locationRequest("Send location"),
		]).resize(),
	);
});

