# npbScriptableWidget

![Image](https://user-images.githubusercontent.com/109525265/183138406-b57c7d59-35ab-4211-8262-6b0599fd4d2e.jpeg)
![Image](https://user-images.githubusercontent.com/109525265/183138419-a70116c1-aabc-4e04-adf4-4fd0878d0437.jpeg)
![Image](https://user-images.githubusercontent.com/109525265/183138423-3c14948a-cf6c-4c56-b6f6-a6f0b550e8c2.jpeg)
![Image](https://user-images.githubusercontent.com/109525265/183138433-ebc3fc13-5117-4600-90fb-ce772e416268.jpeg)


A widget for the NPB (Japanese Baseball league)

Scrapes Yahoo.jp's sports website for the current NPB Games.

I think all the "game status" are accounted for:
- before the game
- live
- final score
- upcoming game time
- interrupted
- no game
- canceled

The widget background will also update depending on the status.
- brightest for live
- darker for final score
- darkest for upcoming game time

Upcoming game time is auto-adjusted for your local time. I think it works properly, but i only tested it for 2 timezones

Adjust the use24HourFormat variable if you like "18:00" or "6:00pm"

Use "Run Script" when interacting with the widget

Put your favorite team as the Parameter
- G = Giants
- T = Tigers
- S = Swallows
- D = Dragons
- DB = DeNA
- C = Carp
- L = Lions
- F = Fighters
- M = Marines
- Bs= Buffaloes
- H = Hawks
- E = Eagles

I think everything is working, but i probably missed some stuff. Let me know if you find an error or want something added
