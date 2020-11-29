$winTitle="Finale"
$setSpeedCtrlId=9911
$okBtnId=1
$instrumentList="Instrument List"
$instrumentListComboBoxAdvancedMode="[CLASS:ComboBox; INSTANCE:1]"
$playBtnId=9905
;$instrumentListComboBoxId=130 ;用ID就是搜不到...
;ConsoleWrite(ControlCommand($instrumentList, "", 130, "IsVisible", "") & @LF)
;ConsoleWrite(ControlCommand($instrumentList, "", 130, "GetCurrentSelection", "") & @LF)
;ConsoleWrite(ControlGetText($instrumentList, "", 130) & @LF)


$msuFilePath="C:\Users\hongk\Desktop\歌譜\23.醉後贈從甥高鎮　【李　白 詩】.mus"
; https://www.autoitscript.com/forum/topic/127349-no-run-the-exe-file/
ShellExecute($msuFilePath)

While ControlCommand($winTitle, "", $okBtnId, "IsVisible", "")=0
   Sleep(10)
   ;ConsoleWrite(ControlCommand($winTitle, "", $okBtnId, "IsVisible", "") & @LF)
WEnd

ConsoleWrite("isInstrumentListThere:" & WinExists($instrumentList)& @LF) ;already 1 here
Sleep(100)
ControlClick($winTitle,"",$okBtnId)

Sleep(200) ; take break after click
ControlCommand($instrumentList, "", $instrumentListComboBoxAdvancedMode, "SetCurrentSelection", 5)

Sleep(200)
$speedStr= ControlGetText ($winTitle, "", $setSpeedCtrlId )
$speed=Number($speedStr)+40
ControlSetText( $winTitle, "", $setSpeedCtrlId,$speed )

Sleep(200)
Send("^e")

Sleep(1000)
ControlClick($winTitle,"",$playBtnId)