Unicode true
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"
!include "StrFunc.nsh"

${StrRep}

Var PROFILE_DIR
Var LBL_PROFILE
Var BTN_PROFILE
Var DLG_PROFILE

Page Custom ProfileDirPage ProfileDirPageLeave

Function ProfileDirPage
  nsDialogs::Create 1018
  Pop $0

  ${If} $0 == error
    Abort
  ${EndIf}

  ${If} $LANGUAGE == ${LANG_VIETNAMESE}
    StrCpy $LBL_PROFILE "Thư mục profile Chrome"
    StrCpy $BTN_PROFILE "Chọn..."
    StrCpy $DLG_PROFILE "Chọn thư mục"
  ${Else}
    StrCpy $LBL_PROFILE "Chrome Profile Directory"
    StrCpy $BTN_PROFILE "Browse..."
    StrCpy $DLG_PROFILE "Select folder"
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 12u "$LBL_PROFILE"
  Pop $1

  ${If} $PROFILE_DIR == ""
    StrCpy $PROFILE_DIR "$APPDATA\Labsgen Tiktok\profiles"
  ${EndIf}

  ${NSD_CreateDirRequest} 0 18u 70% 12u "$PROFILE_DIR"
  Pop $PROFILE_DIR

  ${NSD_CreateBrowseButton} 72% 18u 28% 12u "$BTN_PROFILE"
  Pop $2
  ${NSD_OnClick} $2 ProfileBrowse

  nsDialogs::Show
FunctionEnd

Function ProfileBrowse
  nsDialogs::SelectFolderDialog "$DLG_PROFILE" "$APPDATA\Labsgen Tiktok\profiles"
  Pop $3
  ${If} $3 != ""
    ${NSD_SetText} $PROFILE_DIR $3
  ${EndIf}
FunctionEnd

Function ProfileDirPageLeave
  ${NSD_GetText} $PROFILE_DIR $4
  StrCpy $PROFILE_DIR $4
FunctionEnd

Function .onInstSuccess
  StrCpy $0 "en"
  ${If} $LANGUAGE == ${LANG_VIETNAMESE}
    StrCpy $0 "vi"
  ${EndIf}

  ${StrRep} $1 $PROFILE_DIR "\" "/"
  CreateDirectory "$APPDATA\Labsgen Tiktok"
  FileOpen $2 "$APPDATA\Labsgen Tiktok\installer.json" w
  StrCpy $5 "$\r$\n"
  FileWrite $2 "{"
  StrCpy $6 "$5  $\"language$\": $\"$0$\","
  FileWrite $2 $6
  StrCpy $6 "$5  $\"profilePath$\": $\"$1$\""
  FileWrite $2 $6
  FileWrite $2 "$5}"
  FileWrite $2 "$5"
  FileClose $2
FunctionEnd
