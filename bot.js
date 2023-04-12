import { Telegraf, Markup } from "telegraf";
import fs from "fs";
const BOT_TOKEN = "6131107887:AAFbi7kFwKlcf2yU3OwYeyRO8q0LlSHf4v4";
const Admin_IDs = [928572639, 11];
const bot = new Telegraf(BOT_TOKEN);

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
let Main_menu = getMainMenu()
//main menu
bot.command(['start', 'help', 'goToMainMenu'], async (ctx) => {
	ctx.reply(
		"Hi!\nI'm Psyco bot!\n Powered by salah.",
		Markup.keyboard(Main_menu, {
			wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2,
		}),
	);
})

let ctxForAddFile; // declare a variable to store the context
let ctxForDeletingFile; // declare a variable to store the context

bot.hears(Main_menu, async (ctx) => {
	if (!Admin_IDs.includes(ctx.from.id)) {
		// if it's not an admin, send a simple message
		ctx.reply(`You clicked on: ${ctx.message.text}`);
		await sendDocumentsByCategory(ctx, bot);
	} else {
		await sendDocumentsByCategory(ctx, bot);
		// if it's an admin but not a category, send a message with inline keyboard options
		await ctx.reply(`Hello admin! You clicked on: ${ctx.message.text}`, {
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
});

bot.action("addfile", async (ctx) => {
	// Retrieve the category from the stored context
	const category = ctxForAddFile.message.text;
	ctx.reply(`Please send me a ${category} file or text`);
	// Listen for the user to send the file
	bot.on('document', handleDocument);
	bot.on('photo', handlePhoto)
	bot.on('video', handleVideo)
	bot.on('text',handleText)
})

bot.action("deletefile", async (ctx) => {
	const content = fs.readFileSync("./Data/content.json", "utf-8");
	let data = JSON.parse(content);
	const documents = JSON.parse(content).documents;
	const fileNames = documents.map((doc) => doc.file_name);
	
	let Markup_inlineKey = fileNames.map((fileName) => {
		return [{ text: fileName , callback_data: 'deleteChosenfile' }]
	})
	console.log(Markup_inlineKey)
	ctx.reply("Choose file to delete:", {
		reply_markup: {
			inline_keyboard: Markup_inlineKey
		}
	});


  });
  
  bot.action("deleteChosenfile", async (ctx2) => {
	const content = fs.readFileSync("./Data/content.json", "utf-8");
	let data = JSON.parse(content);
	const fileNameToRemove = ctx2.callbackQuery.data;

	data.documents.forEach((obj, index) => {
		if (obj.file_name === fileNameToRemove) {
			data.documents.splice(index, 1);
		}
	});

	fs.writeFileSync("./Data/content.json", JSON.stringify(data));
	await ctx2.answerCbQuery(`File ${fileNameToRemove} has been deleted`);
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
			
		await media.map((ele)=>{
			if(ele.type === 'document'||ele.type === 'photo'||ele.type === 'video'){
				bot.telegram.sendMediaGroup(ctx.chat.id,[ele])
				console.log("sending media group")
			}else {
				bot.telegram.sendMessage(ctx.chat.id,ele.caption)
				console.log("sending text")
			}
		})	
	}
}

























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

bot.launch();