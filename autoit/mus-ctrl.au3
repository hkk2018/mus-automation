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


$msuFilePath=$CmdLine[1]
; https://www.autoitscript.com/forum/topic/127349-no-run-the-exe-file/
ShellExecute($msuFilePath)

While ControlCommand($winTitle, "", $okBtnId, "IsVisible", "")=0
   Sleep(10)
   ;ConsoleWrite(ControlCommand($winTitle, "", $okBtnId, "IsVisible", "") & @LF)
WEnd

Sleep(300)
WinActivate($winTitle)

ConsoleWrite("isInstrumentListThere:" & WinExists($instrumentList)& @LF) ;already 1 here
; why not 300 then detected as virus?
Sleep(300)
;ConsoleWrite("keep being detecd as virus if not 300 is annoying")
ControlClick($winTitle,"",$okBtnId)

Sleep(300) ; take break after click
ControlCommand($instrumentList, "", $instrumentListComboBoxAdvancedMode, "SetCurrentSelection", 5)

Sleep(300)
;$speedStr= ControlGetText ($winTitle, "", $setSpeedCtrlId )
;$speed=Number($speedStr)+40
$speed=$CmdLine[2]
ControlSetText( $winTitle, "", $setSpeedCtrlId,$speed )

Sleep(300)
Send("^e")

Sleep(300)
ControlClick($winTitle,"",$playBtnId)