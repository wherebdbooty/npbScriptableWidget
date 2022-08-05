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

let LW = WW/2.1		//logo width
let LH = WH/2.1		//logo height

let favoriteTeam = args.widgetParameter?args.widgetParameter:"H"
	favoriteTeam = convertLetterToNPB(favoriteTeam)

let widget = new ListWidget()
let body = widget.addStack()
	with(body){
		topAlignContent()
		size = new Size(WW,WH)
		
		backgroundGradient = _gradient({
			"colors":[Color.dynamic(Color.green(),new Color("#008800")), Color.dynamic(new Color("#004400"), new Color("#002200"))]
		})
		
		borderWidth = 1
		borderColor = Color.clear()
	}

	body.centerAlignContent()

let webview = new WebView()
await webview.loadURL("https://baseball.yahoo.co.jp/npb/")
await webview.waitForLoad()

let _jsResults = await webview.evaluateJavaScript(`
		let _table = document.querySelector("#gm_card");
		let _results = []
		
		// use p.bb-score__link to determine game status

		let _game = {
			"home":{
				"logo":		_table.querySelectorAll("p.bb-score__homeLogo"),
				"score": 	_table.querySelectorAll("span.bb-score__score--left")
			},
			"away":{
				"logo": 	_table.querySelectorAll("p.bb-score__awayLogo"),
				"score":	_table.querySelectorAll("span.bb-score__score--right")
			},
			"times":		_table.querySelectorAll("time"),
			"status":		_table.querySelectorAll("p.bb-score__link")
		}

		let _gameCounter = 0 // can't use i because all games may not have the relevant info

		
		for( let i = 0; i < _game.status.length; i++ ){
			_results[i] = {
				"game":{
					"teams":{
						"home":{
							"npbTeam":	"npb" + (_game.home.logo[i].className.split("--npbTeam"))[1],
							"name":		_game.home.logo[i].innerText
						},
						"away":{
							"npbTeam":	"npb" + (_game.away.logo[i].className.split("--npbTeam"))[1],
							"name":		_game.away.logo[i].innerText
						}
					},
					"status":_game.status[i].innerText
				}
			}
			
			//_game.status[i].innerText = "3回表" //top of 3rd
			//_game.status[i].innerText = "1回裏" //bottom of 1st
				
			switch(_game.status[i].innerText){
				case "ノーゲーム": 	//no game, no score, no time
					_results[i].game.status = "no game"
				break
				case "試合中止":		//cancelled match, no score, no time
					_results[i].game.status = "canceled"
				break
				case "スタメン":		//before the game, no score, yes time
				case "見どころ":		//highlights, no score, yes time
					_results[i].game.status = _game.times[_gameCounter].innerText
					_gameCounter++
				break
				
				default:
					//interrupted, maybe has score || finished match, has score || has inning 回, has score
					with(_game.status[i]){
						let _txt = innerText.match(/中断中|試合終了|回/)
						if(_txt) {
							_results[i].game.teams.home.score = _game.home.score[_gameCounter].innerText
							_results[i].game.teams.away.score = _game.away.score[_gameCounter].innerText
							if(_txt == "中断中")	_results[i].game.status = "Interrupted"
							if(_txt == "試合終了") _results[i].game.status = "Final"
							if(_txt == "回"){
								let _in = (innerText.split("回"))[0]
								_in = _in+(_in=="1"?"st":(_in=="2"?"nd":(_in=="3"?"rd":"th")))
								_results[i].game.status = (innerText.match("表")?"Top":"Bottom") + " of the " +_in
							}

							_gameCounter++
						}
						
					}
				break
			}
		}
		
		completion(_results);`,true)


let _teams = getTeam()

for( let i = 0; i < _jsResults.length; i++ ) {
	
	if( favoriteTeam == _jsResults[i].game.teams.home.npbTeam || favoriteTeam == _jsResults[i].game.teams.away.npbTeam ){
			
		//create stacks here
			
		teamStack = body.addStack()
		with(teamStack){
			layoutVertically()
			size = new Size(body.size.width*.95, body.size.height*.95)
			cornerRadius = 21
			centerAlignContent()
			backgroundImage = await new Request("https://upload.wikimedia.org/wikipedia/commons/5/59/Baseball_diamond_marines.jpg").loadImage()
		}
		
		let logos = {"home":'',"away":''}
		
		for(let k in logos)
			if(_teams[_jsResults[i].game.teams[k].npbTeam].letter!="H")
				logos[k] = await new Request("https://s.yimg.jp/images/sports/baseball/npb/logo/team/120/"+
							_teams[_jsResults[i].game.teams[k].npbTeam].letter+".png").loadImage()
			else //get better logo for the Softbank Hawks
				logos[k] = await new Request("https://upload.wikimedia.org/wikipedia/en/c/ca/Softbank_hawks_logo.png").loadImage()
		
		
		teamStack.logoArea = teamStack.addStack()
		with(teamStack.logoArea){
			size = new Size(teamStack.size.width,teamStack.size.height*.55)
			backgroundImage = drawLogoArea(logos) //img
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
		
		/*--use this to show the "starts at 18:00" view--*/
		//delete _jsResults[i].game.teams.home.score
		//_jsResults[i].game.status = "18:00"
		
		if(typeof _jsResults[i].game.teams.home.score == "undefined"){
			if(_jsResults[i].game.status.match(":")){

				formatStatusAreaText(teamStack.statusArea.addText("Starts at " + calculateTimeZoneOffset(_jsResults[i].game.status)))
				teamStack.backgroundGradient = _gradient({"colors":[new Color("#060",1), Color.clear()]})

			}
			else
				formatStatusAreaText(teamStack.statusArea.addText(_jsResults[i].game.status))
		}
		else {
			printScores(_jsResults[i])
			formatStatusAreaText(teamStack.statusArea.addText(_jsResults[i].game.status))
			
			if(_jsResults[i].game.status == "Final")
				teamStack.backgroundGradient = _gradient({
					"colors":[new Color("#060",1), Color.clear()],
					"locations":[0,.75]
				})
		}
	}
}



if(_debug)	widget.presentSmall()
else{
	Script.setWidget(widget)
	App.close()
}
Script.complete()

function calculateTimeZoneOffset(_gameTime){
	let tz = new Date()
		tz = (-540-tz.getTimezoneOffset())/60
		tz = ((_gameTime.split(":"))[0]*1+tz)

		tz = (use24HourFormat?tz:(tz>12?tz-12:tz)) + ":" + (_gameTime.split(":"))[1] + (use24HourFormat?"":(tz<12?"am":"pm"))
		
	return tz
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
			drawTextInRect(_obj.game.teams[k].score, new Rect(x-1,y-1, w, h))
			drawTextInRect(_obj.game.teams[k].score, new Rect(x+1,y-1, w, h))
			drawTextInRect(_obj.game.teams[k].score, new Rect(x+1,y+1, w, h))
			drawTextInRect(_obj.game.teams[k].score, new Rect(x-1,y+1, w, h))
		
			setTextColor(Color.white())
			drawTextInRect(_obj.game.teams[k].score, new Rect(x, y, w, h))
		}
		
		teamStack.scoreArea.backgroundImage = getImage()
	}
}

function homeWinning(_obj){return (_obj.game.teams.home.score > _obj.game.teams.away.score)}
function awayWinning(_obj){return (_obj.game.teams.home.score < _obj.game.teams.away.score)}
function tied(_obj){		return (_obj.game.teams.home.score == _obj.game.teams.away.score)}

function _gradient(_props){
	let temp = new LinearGradient()
	for( let i in _props)
		temp[i] = _props[i]
		
	temp.locations = _props.locations?_props.locations:[0,1.5]

	return temp
}

function convertLetterToNPB(_letter){
	let _teams = getTeam()
	for( let i in _teams )
		if(_teams[i].letter == _letter)
			return "npb" + _teams[i].npbTeam

	return 1
}
	
function getTeam(_teamNumber){
	let _teams = {
		"npb1":{  "name":{ "jp":"巨人","en":"Giants" }, "npbTeam":1, "letter":"G" },
		"npb5":{  "name":{ "jp":"阪神","en":"Tigers" }, "npbTeam":5, "letter":"T" },
		"npb2":{  "name":{ "jp":"ヤクルト","en":"Swallows" }, "npbTeam":2, "letter":"S" },
		"npb4":{  "name":{ "jp":"中日","en":"Dragons" }, "npbTeam":4, "letter":"D" },
		"npb3":{ "name":{ "jp":"DeNA","en":"DeNA" }, "npbTeam":3, "letter":"DB" },
		"npb6":{  "name":{ "jp":"広島","en":"Carp" }, "npbTeam":6, "letter":"C" },
		"npb8":{  "name":{ "jp":"日本ハム","en":"Fighters" }, "npbTeam":8, "letter":"F" },
		"npb12":{  "name":{ "jp":"ソフトバンク","en":"Hawks" }, "npbTeam":12, "letter":"H" },
		"npb376":{  "name":{ "jp":"楽天","en":"Eagles" }, "npbTeam":376, "letter":"E" },
		"npb9":{  "name":{ "jp":"ロッテ","en":"Marines" }, "npbTeam":9, "letter":"M" },
		"npb7":{  "name":{ "jp":"西武","en":"Lions" }, "npbTeam":7, "letter":"L" },
		"npb11":{ "name":{ "jp":"オリックス","en":"Buffaloes" }, "npbTeam":11, "letter":"Bs" }
	}
	return (arguments.length?_teams[_teamNumber]:_teams)
}
