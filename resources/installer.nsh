!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"
!include "StrFunc.nsh"

${StrRep}

LangString LBL_PROFILE_DIR ${LANG_ENGLISH} "Chrome Profile Directory"
LangString LBL_PROFILE_DIR ${LANG_VIETNAMESE} "Thu muc profile Chrome"
LangString BTN_BROWSE ${LANG_ENGLISH} "Browse..."
LangString BTN_BROWSE ${LANG_VIETNAMESE} "Chon..."
LangString DLG_SELECT ${LANG_ENGLISH} "Select folder"
LangString DLG_SELECT ${LANG_VIETNAMESE} "Chon thu muc"

Var PROFILE_DIR

Page Custom ProfileDirPage ProfileDirPageLeave

Function ProfileDirPage
  nsDialogs::Create 1018
  Pop $0

  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 12u "$(LBL_PROFILE_DIR)"
  Pop $1

  ${If} $PROFILE_DIR == ""
    StrCpy $PROFILE_DIR "$APPDATA\Labsgen Tiktok\profiles"
  ${EndIf}

  ${NSD_CreateDirRequest} 0 18u 70% 12u "$PROFILE_DIR"
  Pop $PROFILE_DIR

  ${NSD_CreateBrowseButton} 72% 18u 28% 12u "$(BTN_BROWSE)"
  Pop $2
  ${NSD_OnClick} $2 ProfileBrowse

  nsDialogs::Show
FunctionEnd

Function ProfileBrowse
  nsDialogs::SelectFolderDialog "$(DLG_SELECT)" "$APPDATA\Labsgen Tiktok\profiles"
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
  FileWrite $2 "$5  \"language\": \"$0\","
  FileWrite $2 "$5  \"profilePath\": \"$1\""
  FileWrite $2 "$5}"
  FileWrite $2 "$5"
  FileClose $2
FunctionEnd
