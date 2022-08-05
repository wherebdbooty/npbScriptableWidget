# npbScriptableWidget
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
