
 $instrumentList="Instrument List"

   ConsoleWrite(ControlCommand($instrumentList, "", 130, "IsVisible", "") & @LF)
  ConsoleWrite(ControlCommand($instrumentList, "", "[CLASS:ComboBox; INSTANCE:1]", "SetCurrentSelection", 5) & @LF)
   ConsoleWrite(ControlGetText($instrumentList, "", "[CLASS:ComboBox; INSTANCE:1]") & @LF)