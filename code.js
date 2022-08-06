//works on phones now

let _debug = false //change to true if editing the widget, false when finished

// Set "When interacting" = "Run Script"
/* Put the letter of your team in the "Parameter" section
	G = Giants
	T = Tigers
	S = Swallows
	D = Dragons
	DB = DeNA
	C = Carp
	L = Lions
	F = Fighters
	M = Marines
	Bs= Buffaloes
	H = Hawks
	E = Eagles
*/

let use24HourFormat = true

let WW = 155
let WH = 155

if(Device.isPhone()){
	WW = 150
	WH = 150	
}

let favoriteTeam = args.widgetParameter?args.widgetParameter:"L"

let widget = new ListWidget()
let body = widget.addStack()
	with(body){
		topAlignContent()
		centerAlignContent()
		size = new Size(WW,WH)
		
		backgroundGradient = _gradient({
			"colors":[Color.dynamic(Color.green(),new Color("#008800")), Color.dynamic(new Color("#004400"), new Color("#002200"))]
		})
		
		borderWidth = 1
		borderColor = Color.clear()
	}

let webview = new WebView()
await webview.loadURL("https://npb.jp/games/2022/")
await webview.waitForLoad()

let game = await webview.evaluateJavaScript(`

		let _table = document.querySelector("#game_score")
			_table = _table.querySelectorAll("div.score_table")
		
		let _game = []
			
		for( let i=0; i < _table.length; i++ ){

			let _logos = _table[i].querySelectorAll("img")
			let _scores= _table[i].querySelectorAll("td.score")
			let _status= _table[i].querySelector("td.state")
			
			

			_game.push({
				"home":{
					"logo":(((_logos[0].src.split("/")).pop()).split("_"))[1].toUpperCase(),
					"score":_scores[0].innerText
				},
				"away":{
					"logo":(((_logos[1].src.split("/")).pop()).split("_"))[1].toUpperCase(),
					"score":_scores[1].innerText
				},
				"status":_status.innerText
			})
		}

		completion(_game);`,true)

teamStack = body.addStack()
with(teamStack){
	layoutVertically()
	size = new Size(body.size.width*.95, body.size.height*.95)
	cornerRadius = 21
	centerAlignContent()

	backgroundImage = await new Request("https://upload.wikimedia.org/wikipedia/commons/5/59/Baseball_diamond_marines.jpg").loadImage()
			
}

for( let i = 0; i < game.length; i++ ) {
	
	game[i].home.logo += game[i].home.logo == "B"?"s":"" //special case for Buffaloes logo
	game[i].away.logo += game[i].away.logo == "B"?"s":""
	
	if( favoriteTeam == game[i].home.logo || favoriteTeam == game[i].away.logo ){
		
		let logos = {"home":'',"away":''}
		
		for(let k in logos)
			if(game[i][k].logo != "H")
				logos[k] = await new Request("https://s.yimg.jp/images/sports/baseball/npb/logo/team/120/"+game[i][k].logo+".png").loadImage()
			else //get better logo for the Softbank Hawks
				logos[k] = await new Request("https://upload.wikimedia.org/wikipedia/en/c/ca/Softbank_hawks_logo.png").loadImage()
		
		
		teamStack.logoArea = teamStack.addStack()
		with(teamStack.logoArea){
			size = new Size(teamStack.size.width,teamStack.size.height*.55)
			backgroundImage = drawLogoArea(logos)
		}
		
		
		teamStack.scoreArea = teamStack.addStack()
		with(teamStack.scoreArea){
			size = new Size(teamStack.size.width,teamStack.size.height*.27)
			for(let k in {"home":'',"away":''}){
				teamStack.scoreArea[k] = addStack()
				with(teamStack.scoreArea[k]){
					size = new Size(teamStack.scoreArea.size.width*.5,teamStack.scoreArea.size.height)
				}
			}
		}

		
		teamStack.statusArea = teamStack.addStack()
		with(teamStack.statusArea){
			setPadding(0,WW*.05,0,WW*.05)
			size = new Size(teamStack.size.width, teamStack.size.height*.18)
			centerAlignContent()
			backgroundColor = Color.dynamic(new Color("000", .5), new Color("000",.5))
			textColor = Color.dynamic(Color.white(), Color.white())
		}
		
		let translatedText = translateStatus(game[i].status)

		printScores(game[i])
		adjustBackground(translatedText)
		formatStatusAreaText(teamStack.statusArea.addText(translatedText))
		
	}
}



if(_debug)	widget.presentSmall()
else{
	Script.setWidget(widget)
	App.close()
}
Script.complete()

function translateStatus(_txt){
	let tt = _txt.substr(_txt.lastIndexOf(" ")+1) //remove the venue

	if(tt.match("回")){
		tt = tt.split("回")
		return (tt[1]=="表"?"Top":"Bottom") + " of the " + tt[0] + (tt[0]>3?"th":(tt[0]>2?"rd":(tt[0]>1?"nd":"st")))
	}
	
	if(tt.match("時")){ //14時00分 is 14:00
		tt = tt.split("時")
		tt = tt[0]+":"+tt[1].replace("分","")
		return "Starts at " + calculateTimeZoneOffset(tt)
	}
	
	if(tt.match("終了"))		return "Final"
	if(tt.match("中止"))		return "Cancelled"
	if(tt.match("ム"))		return "No Game"
	if(tt.match("中"))		return "Interrupted"
	
	return tt
}

function adjustBackground(_text){
	if(_text.match("Starts at"))
		teamStack.backgroundGradient = _gradient({"colors":[new Color("#060",1), Color.clear()]})
	if(_text == "Final")
		teamStack.backgroundGradient = _gradient({
			"colors":[new Color("#060",1), Color.clear()],
			"locations":[0,.75]
		})
}

function calculateTimeZoneOffset(_gameTime){
	let tz = new Date()
		tz = (-540-tz.getTimezoneOffset())/60
		tz = ((_gameTime.split(":"))[0]*1+tz)

		return (use24HourFormat?tz:(tz % 12 || 12)) + ":" + (_gameTime.split(":"))[1] + (use24HourFormat?"":(tz<12?"am":"pm"))
}

function formatStatusAreaText(_obj){
	with(_obj){
		font = Font.mediumRoundedSystemFont(14)
		minimumScaleFactor = 0.2
		textColor = Color.white()
		shadowColor = Color.gray()
		shadowRadius = 1
		shadowOffset = new Point(0,0)
	}
}

function drawLogoArea(_logos){
	let ctx = new DrawContext()
		
	with(ctx){
		size = new Size(teamStack.size.width, teamStack.size.height*.55)
		respectScreenScale = true
		opaque = false

		let _rect = new Rect(5, 20, 60, 60)
		setFont(Font.regularMonospacedSystemFont(64))
		setTextColor(new Color("#ffffff",.1))
		setFillColor(new Color("#fff",.6))

		fillEllipse(_rect)
			
		drawImageInRect(_logos.home, _rect)
			
		_rect = new Rect(body.size.width/2+5, 20, 60, 60)
		fillEllipse(_rect)
		drawImageInRect(_logos.away, _rect)
			
		return getImage()
	}
	
}


function printScores(_obj){
	let _ctx = new DrawContext()
	with(_ctx){
		size = new Size(teamStack.size.width,teamStack.size.height*.27)
		respectScreenScale = true
		opaque = false
		setTextAlignedCenter()
		setFont(Font.regularSystemFont(30))
		let x = 0
		let y = 0
		let w = _ctx.size.width/2
		let h = _ctx.size.height
		
		for( let k in {"home":'',"away":''} ){
			if(k=="away") x = _ctx.size.width/2 + 2

			setTextColor(Color.black())
			drawTextInRect(_obj[k].score, new Rect(x-1,y-1, w, h))
			drawTextInRect(_obj[k].score, new Rect(x+1,y-1, w, h))
			drawTextInRect(_obj[k].score, new Rect(x+1,y+1, w, h))
			drawTextInRect(_obj[k].score, new Rect(x-1,y+1, w, h))
		
			setTextColor(Color.white())
			drawTextInRect(_obj[k].score, new Rect(x, y, w, h))
		}
		
		teamStack.scoreArea.backgroundImage = getImage()
	}
}

function _gradient(_props){
	let temp = new LinearGradient()
	for( let i in _props)
		temp[i] = _props[i]
		
	temp.locations = _props.locations?_props.locations:[0,1.5]

	return temp
}
