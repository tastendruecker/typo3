import{ContextTracker,ExternalTokenizer,LRParser}from"@lezer/lr";import{styleTags,tags}from"@lezer/highlight";import{parseMixed}from"@lezer/common";const scriptText=54,StartCloseScriptTag=1,styleText=55,StartCloseStyleTag=2,textareaText=56,StartCloseTextareaTag=3,EndTag=4,SelfClosingEndTag=5,StartTag=6,StartScriptTag=7,StartStyleTag=8,StartTextareaTag=9,StartSelfClosingTag=10,StartCloseTag=11,NoMatchStartCloseTag=12,MismatchedStartCloseTag=13,missingCloseTag=57,IncompleteCloseTag=14,commentContent$1=58,Element=20,TagName=22,Attribute=23,AttributeName=24,AttributeValue=26,UnquotedAttributeValue=27,ScriptText=28,StyleText=31,TextareaText=34,OpenTag=36,CloseTag=37,Dialect_noMatch=0,Dialect_selfClosing=1,selfClosers={area:!0,base:!0,br:!0,col:!0,command:!0,embed:!0,frame:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0,menuitem:!0},implicitlyClosed={dd:!0,li:!0,optgroup:!0,option:!0,p:!0,rp:!0,rt:!0,tbody:!0,td:!0,tfoot:!0,th:!0,tr:!0},closeOnOpen={dd:{dd:!0,dt:!0},dt:{dd:!0,dt:!0},li:{li:!0},option:{option:!0,optgroup:!0},optgroup:{optgroup:!0},p:{address:!0,article:!0,aside:!0,blockquote:!0,dir:!0,div:!0,dl:!0,fieldset:!0,footer:!0,form:!0,h1:!0,h2:!0,h3:!0,h4:!0,h5:!0,h6:!0,header:!0,hgroup:!0,hr:!0,menu:!0,nav:!0,ol:!0,p:!0,pre:!0,section:!0,table:!0,ul:!0},rp:{rp:!0,rt:!0},rt:{rp:!0,rt:!0},tbody:{tbody:!0,tfoot:!0},td:{td:!0,th:!0},tfoot:{tbody:!0},th:{td:!0,th:!0},thead:{tbody:!0,tfoot:!0},tr:{tr:!0}};function nameChar(e){return 45==e||46==e||58==e||e>=65&&e<=90||95==e||e>=97&&e<=122||e>=161}function isSpace(e){return 9==e||10==e||13==e||32==e}let cachedName=null,cachedInput=null,cachedPos=0;function tagNameAfter(e,O){let t=e.pos+O;if(cachedPos==t&&cachedInput==e)return cachedName;let n=e.peek(O);for(;isSpace(n);)n=e.peek(++O);let a="";for(;nameChar(n);)a+=String.fromCharCode(n),n=e.peek(++O);return cachedInput=e,cachedPos=t,cachedName=a?a.toLowerCase():n==question||n==bang?void 0:null}const lessThan=60,greaterThan=62,slash=47,question=63,bang=33,dash=45;function ElementContext(e,O){this.name=e,this.parent=O,this.hash=O?O.hash:0;for(let O=0;O<e.length;O++)this.hash+=(this.hash<<4)+e.charCodeAt(O)+(e.charCodeAt(O)<<8)}const startTagTerms=[6,10,7,8,9],elementContext=new ContextTracker({start:null,shift:(e,O,t,n)=>startTagTerms.indexOf(O)>-1?new ElementContext(tagNameAfter(n,1)||"",e):e,reduce:(e,O)=>20==O&&e?e.parent:e,reuse(e,O,t,n){let a=O.type.id;return 6==a||36==a?new ElementContext(tagNameAfter(n,1)||"",e):e},hash:e=>e?e.hash:0,strict:!1}),tagStart=new ExternalTokenizer(((e,O)=>{if(60!=e.next)return void(e.next<0&&O.context&&e.acceptToken(57));e.advance();let t=47==e.next;t&&e.advance();let n=tagNameAfter(e,0);if(void 0===n)return;if(!n)return e.acceptToken(t?14:6);let a=O.context?O.context.name:null;if(t){if(n==a)return e.acceptToken(11);if(a&&implicitlyClosed[a])return e.acceptToken(57,-2);if(O.dialectEnabled(0))return e.acceptToken(12);for(let e=O.context;e;e=e.parent)if(e.name==n)return;e.acceptToken(13)}else{if("script"==n)return e.acceptToken(7);if("style"==n)return e.acceptToken(8);if("textarea"==n)return e.acceptToken(9);if(selfClosers.hasOwnProperty(n))return e.acceptToken(10);a&&closeOnOpen[a]&&closeOnOpen[a][n]?e.acceptToken(57,-1):e.acceptToken(6)}}),{contextual:!0}),commentContent=new ExternalTokenizer((e=>{for(let O=0,t=0;;t++){if(e.next<0){t&&e.acceptToken(58);break}if(45==e.next)O++;else{if(62==e.next&&O>=2){t>3&&e.acceptToken(58,-2);break}O=0}e.advance()}}));function inForeignElement(e){for(;e;e=e.parent)if("svg"==e.name||"math"==e.name)return!0;return!1}const endTag=new ExternalTokenizer(((e,O)=>{if(47==e.next&&62==e.peek(1)){let t=O.dialectEnabled(1)||inForeignElement(O.context);e.acceptToken(t?5:4,2)}else 62==e.next&&e.acceptToken(4,1)}));function contentTokenizer(e,O,t){let n=2+e.length;return new ExternalTokenizer((a=>{for(let r=0,s=0,l=0;;l++){if(a.next<0){l&&a.acceptToken(O);break}if(0==r&&60==a.next||1==r&&47==a.next||r>=2&&r<n&&a.next==e.charCodeAt(r-2))r++,s++;else if(2!=r&&r!=n||!isSpace(a.next)){if(r==n&&62==a.next){l>s?a.acceptToken(O,-s):a.acceptToken(t,-(s-2));break}if((10==a.next||13==a.next)&&l){a.acceptToken(O,1);break}r=s=0}else s++;a.advance()}}))}const scriptTokens=contentTokenizer("script",54,1),styleTokens=contentTokenizer("style",55,2),textareaTokens=contentTokenizer("textarea",56,3),htmlHighlighting=styleTags({"Text RawText":tags.content,"StartTag StartCloseTag SelfClosingEndTag EndTag":tags.angleBracket,TagName:tags.tagName,"MismatchedCloseTag/TagName":[tags.tagName,tags.invalid],AttributeName:tags.attributeName,"AttributeValue UnquotedAttributeValue":tags.attributeValue,Is:tags.definitionOperator,"EntityReference CharacterReference":tags.character,Comment:tags.blockComment,ProcessingInst:tags.processingInstruction,DoctypeDecl:tags.documentMeta}),parser=LRParser.deserialize({version:14,states:",xOVO!rOOO!WQ#tO'#CqO!]Q#tO'#CzO!bQ#tO'#C}O!gQ#tO'#DQO!lQ#tO'#DSO!qOaO'#CpO!|ObO'#CpO#XOdO'#CpO$eO!rO'#CpOOO`'#Cp'#CpO$lO$fO'#DTO$tQ#tO'#DVO$yQ#tO'#DWOOO`'#Dk'#DkOOO`'#DY'#DYQVO!rOOO%OQ&rO,59]O%WQ&rO,59fO%`Q&rO,59iO%hQ&rO,59lO%sQ&rO,59nOOOa'#D^'#D^O%{OaO'#CxO&WOaO,59[OOOb'#D_'#D_O&`ObO'#C{O&kObO,59[OOOd'#D`'#D`O&sOdO'#DOO'OOdO,59[OOO`'#Da'#DaO'WO!rO,59[O'_Q#tO'#DROOO`,59[,59[OOOp'#Db'#DbO'dO$fO,59oOOO`,59o,59oO'lQ#|O,59qO'qQ#|O,59rOOO`-E7W-E7WO'vQ&rO'#CsOOQW'#DZ'#DZO(UQ&rO1G.wOOOa1G.w1G.wO(^Q&rO1G/QOOOb1G/Q1G/QO(fQ&rO1G/TOOOd1G/T1G/TO(nQ&rO1G/WOOO`1G/W1G/WOOO`1G/Y1G/YO(yQ&rO1G/YOOOa-E7[-E7[O)RQ#tO'#CyOOO`1G.v1G.vOOOb-E7]-E7]O)WQ#tO'#C|OOOd-E7^-E7^O)]Q#tO'#DPOOO`-E7_-E7_O)bQ#|O,59mOOOp-E7`-E7`OOO`1G/Z1G/ZOOO`1G/]1G/]OOO`1G/^1G/^O)gQ,UO,59_OOQW-E7X-E7XOOOa7+$c7+$cOOOb7+$l7+$lOOOd7+$o7+$oOOO`7+$r7+$rOOO`7+$t7+$tO)rQ#|O,59eO)wQ#|O,59hO)|Q#|O,59kOOO`1G/X1G/XO*RO7[O'#CvO*dOMhO'#CvOOQW1G.y1G.yOOO`1G/P1G/POOO`1G/S1G/SOOO`1G/V1G/VOOOO'#D['#D[O*uO7[O,59bOOQW,59b,59bOOOO'#D]'#D]O+WOMhO,59bOOOO-E7Y-E7YOOQW1G.|1G.|OOOO-E7Z-E7Z",stateData:"+s~O!^OS~OUSOVPOWQOXROYTO[]O][O^^O`^Oa^Ob^Oc^Ox^O{_O!dZO~OfaO~OfbO~OfcO~OfdO~OfeO~O!WfOPlP!ZlP~O!XiOQoP!ZoP~O!YlORrP!ZrP~OUSOVPOWQOXROYTOZqO[]O][O^^O`^Oa^Ob^Oc^Ox^O!dZO~O!ZrO~P#dO![sO!euO~OfvO~OfwO~OS|OhyO~OS!OOhyO~OS!QOhyO~OS!SOT!TOhyO~OS!TOhyO~O!WfOPlX!ZlX~OP!WO!Z!XO~O!XiOQoX!ZoX~OQ!ZO!Z!XO~O!YlORrX!ZrX~OR!]O!Z!XO~O!Z!XO~P#dOf!_O~O![sO!e!aO~OS!bO~OS!cO~Oi!dOSgXhgXTgX~OS!fOhyO~OS!gOhyO~OS!hOhyO~OS!iOT!jOhyO~OS!jOhyO~Of!kO~Of!lO~Of!mO~OS!nO~Ok!qO!`!oO!b!pO~OS!rO~OS!sO~OS!tO~Oa!uOb!uOc!uO!`!wO!a!uO~Oa!xOb!xOc!xO!b!wO!c!xO~Oa!uOb!uOc!uO!`!{O!a!uO~Oa!xOb!xOc!xO!b!{O!c!xO~OT~bac!dx{!d~",goto:"%p!`PPPPPPPPPPPPPPPPPPPP!a!gP!mPP!yP!|#P#S#Y#]#`#f#i#l#r#x!aP!a!aP$O$U$l$r$x%O%U%[%bPPPPPPPP%hX^OX`pXUOX`pezabcde{}!P!R!UR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ}bQ!PcQ!RdQ!UeZ!e{}!P!R!UQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",nodeNames:"⚠ StartCloseTag StartCloseTag StartCloseTag EndTag SelfClosingEndTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",maxTerm:67,context:elementContext,nodeProps:[["closedBy",-10,1,2,3,7,8,9,10,11,12,13,"EndTag",6,"EndTag SelfClosingEndTag",-4,21,30,33,36,"CloseTag"],["openedBy",4,"StartTag StartCloseTag",5,"StartTag",-4,29,32,35,37,"OpenTag"],["group",-9,14,17,18,19,20,39,40,41,42,"Entity",16,"Entity TextContent",-3,28,31,34,"TextContent Entity"]],propSources:[htmlHighlighting],skippedNodes:[0],repeatNodeCount:9,tokenData:"#%g!aR!YOX$qXY,QYZ,QZ[$q[]&X]^,Q^p$qpq,Qqr-_rs4ysv-_vw5iwxJ^x}-_}!OKP!O!P-_!P!Q$q!Q![-_![!]!!O!]!^-_!^!_!&W!_!`#$o!`!a&X!a!c-_!c!}!!O!}#R-_#R#S!!O#S#T3V#T#o!!O#o#s-_#s$f$q$f%W-_%W%o!!O%o%p-_%p&a!!O&a&b-_&b1p!!O1p4U-_4U4d!!O4d4e-_4e$IS!!O$IS$I`-_$I`$Ib!!O$Ib$Kh-_$Kh%#t!!O%#t&/x-_&/x&Et!!O&Et&FV-_&FV;'S!!O;'S;:j!&Q;:j;=`4s<%l?&r-_?&r?Ah!!O?Ah?BY$q?BY?Mn!!O?MnO$q!Z$|c`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr$qrs&}sv$qvw+Pwx(tx!^$q!^!_*V!_!a&X!a#S$q#S#T&X#T;'S$q;'S;=`+z<%lO$q!R&bX`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&Xq'UV`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}P'pT`POv'kw!^'k!_;'S'k;'S;=`(P<%lO'kP(SP;=`<%l'kp([S!cpOv(Vx;'S(V;'S;=`(h<%lO(Vp(kP;=`<%l(Vq(qP;=`<%l&}a({W`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t`)jT!a`Or)esv)ew;'S)e;'S;=`)y<%lO)e`)|P;=`<%l)ea*SP;=`<%l(t!Q*^V!a`!cpOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!Q*vP;=`<%l*V!R*|P;=`<%l&XW+UYkWOX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+PW+wP;=`<%l+P!Z+}P;=`<%l$q!a,]``P!a`!cp!^^OX&XXY,QYZ,QZ]&X]^,Q^p&Xpq,Qqr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!_-ljhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_1n!_!a&X!a#S-_#S#T3V#T#s-_#s$f$q$f;'S-_;'S;=`4s<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q[/echSkWOX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!^!_0p!a#S/^#S#T0p#T#s/^#s$f+P$f;'S/^;'S;=`1h<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+PS0uXhSqr0psw0px!P0p!Q!_0p!a#s0p$f;'S0p;'S;=`1b<%l?Ah0p?BY?Mn0pS1eP;=`<%l0p[1kP;=`<%l/^!U1wbhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!U3SP;=`<%l1n!V3bchS`P!a`!cpOq&Xqr3Vrs&}sv3Vvw0pwx(tx!P3V!P!Q&X!Q!^3V!^!_1n!_!a&X!a#s3V#s$f&X$f;'S3V;'S;=`4m<%l?Ah3V?Ah?BY&X?BY?Mn3V?MnO&X!V4pP;=`<%l3V!_4vP;=`<%l-_!Z5SV!`h`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}!_5rjhSkWc!ROX7dXZ8qZ[7d[^8q^p7dqr:crs8qst@Ttw:cwx8qx!P:c!P!Q7d!Q!]:c!]!^/^!^!_=p!_!a8q!a#S:c#S#T=p#T#s:c#s$f7d$f;'S:c;'S;=`?}<%l?Ah:c?Ah?BY7d?BY?Mn:c?MnO7d!Z7ibkWOX7dXZ8qZ[7d[^8q^p7dqr7drs8qst+Ptw7dwx8qx!]7d!]!^9f!^!a8q!a#S7d#S#T8q#T;'S7d;'S;=`:]<%lO7d!R8tVOp8qqs8qt!]8q!]!^9Z!^;'S8q;'S;=`9`<%lO8q!R9`Oa!R!R9cP;=`<%l8q!Z9mYkWa!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!Z:`P;=`<%l7d!_:jjhSkWOX7dXZ8qZ[7d[^8q^p7dqr:crs8qst/^tw:cwx8qx!P:c!P!Q7d!Q!]:c!]!^<[!^!_=p!_!a8q!a#S:c#S#T=p#T#s:c#s$f7d$f;'S:c;'S;=`?}<%l?Ah:c?Ah?BY7d?BY?Mn:c?MnO7d!_<echSkWa!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!^!_0p!a#S/^#S#T0p#T#s/^#s$f+P$f;'S/^;'S;=`1h<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!V=udhSOp8qqr=prs8qst0ptw=pwx8qx!P=p!P!Q8q!Q!]=p!]!^?T!^!_=p!_!a8q!a#s=p#s$f8q$f;'S=p;'S;=`?w<%l?Ah=p?Ah?BY8q?BY?Mn=p?MnO8q!V?[XhSa!Rqr0psw0px!P0p!Q!_0p!a#s0p$f;'S0p;'S;=`1b<%l?Ah0p?BY?Mn0p!V?zP;=`<%l=p!_@QP;=`<%l:c!_@[ihSkWOXAyXZCTZ[Ay[^CT^pAyqrDrrsCTswDrwxCTx!PDr!P!QAy!Q!]Dr!]!^/^!^!_G|!_!aCT!a#SDr#S#TG|#T#sDr#s$fAy$f;'SDr;'S;=`JW<%l?AhDr?Ah?BYAy?BY?MnDr?MnOAy!ZBOakWOXAyXZCTZ[Ay[^CT^pAyqrAyrsCTswAywxCTx!]Ay!]!^Cu!^!aCT!a#SAy#S#TCT#T;'SAy;'S;=`Dl<%lOAy!RCWUOpCTq!]CT!]!^Cj!^;'SCT;'S;=`Co<%lOCT!RCoOb!R!RCrP;=`<%lCT!ZC|YkWb!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!ZDoP;=`<%lAy!_DyihSkWOXAyXZCTZ[Ay[^CT^pAyqrDrrsCTswDrwxCTx!PDr!P!QAy!Q!]Dr!]!^Fh!^!_G|!_!aCT!a#SDr#S#TG|#T#sDr#s$fAy$f;'SDr;'S;=`JW<%l?AhDr?Ah?BYAy?BY?MnDr?MnOAy!_FqchSkWb!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!^!_0p!a#S/^#S#T0p#T#s/^#s$f+P$f;'S/^;'S;=`1h<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!VHRchSOpCTqrG|rsCTswG|wxCTx!PG|!P!QCT!Q!]G|!]!^I^!^!_G|!_!aCT!a#sG|#s$fCT$f;'SG|;'S;=`JQ<%l?AhG|?Ah?BYCT?BY?MnG|?MnOCT!VIeXhSb!Rqr0psw0px!P0p!Q!_0p!a#s0p$f;'S0p;'S;=`1b<%l?Ah0p?BY?Mn0p!VJTP;=`<%lG|!_JZP;=`<%lDr!ZJgW!bx`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t!aK^lhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OMU!O!P-_!P!Q$q!Q!^-_!^!_1n!_!a&X!a#S-_#S#T3V#T#s-_#s$f$q$f;'S-_;'S;=`4s<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!aMckhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_1n!_!`&X!`!a! W!a#S-_#S#T3V#T#s-_#s$f$q$f;'S-_;'S;=`4s<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!T! cX`P!a`!cp!eQOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!a!!_!ZhSfQ`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!O!!O!O!P!!O!P!Q$q!Q![!!O![!]!!O!]!^-_!^!_1n!_!a&X!a!c-_!c!}!!O!}#R-_#R#S!!O#S#T3V#T#o!!O#o#s-_#s$f$q$f$}-_$}%O!!O%O%W-_%W%o!!O%o%p-_%p&a!!O&a&b-_&b1p!!O1p4U!!O4U4d!!O4d4e-_4e$IS!!O$IS$I`-_$I`$Ib!!O$Ib$Je-_$Je$Jg!!O$Jg$Kh-_$Kh%#t!!O%#t&/x-_&/x&Et!!O&Et&FV-_&FV;'S!!O;'S;:j!&Q;:j;=`4s<%l?&r-_?&r?Ah!!O?Ah?BY$q?BY?Mn!!O?MnO$q!a!&TP;=`<%l!!O!V!&achS!a`!cpOq*Vqr!'lrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a!b!Ey!b#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!'uhhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex}1n}!O!)a!O!P1n!P!Q*V!Q!_1n!_!a*V!a!f1n!f!g!,]!g#W1n#W#X!<y#X#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!)jdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex}1n}!O!*x!O!P1n!P!Q*V!Q!_1n!_!a*V!a#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!+TbhS!a`!cp!dPOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!,fdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a!q1n!q!r!-t!r#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!-}dhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a!e1n!e!f!/]!f#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!/fdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a!v1n!v!w!0t!w#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!0}dhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a!{1n!{!|!2]!|#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!2fdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a!r1n!r!s!3t!s#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!3}dhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a!g1n!g!h!5]!h#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!5fchS!a`!cpOq!6qqr!5]rs!7hsv!5]vw!;`wx!9[x!P!5]!P!Q!6q!Q!_!5]!_!`!6q!`!a!:j!a#s!5]#s$f!6q$f;'S!5];'S;=`!<s<%l?Ah!5]?Ah?BY!6q?BY?Mn!5]?MnO!6q!R!6xY!a`!cpOr!6qrs!7hsv!6qvw!8Swx!9[x!`!6q!`!a!:j!a;'S!6q;'S;=`!;Y<%lO!6qq!7mV!cpOv!7hvx!8Sx!`!7h!`!a!8q!a;'S!7h;'S;=`!9U<%lO!7hP!8VTO!`!8S!`!a!8f!a;'S!8S;'S;=`!8k<%lO!8SP!8kO{PP!8nP;=`<%l!8Sq!8xS!cp{POv(Vx;'S(V;'S;=`(h<%lO(Vq!9XP;=`<%l!7ha!9aX!a`Or!9[rs!8Ssv!9[vw!8Sw!`!9[!`!a!9|!a;'S!9[;'S;=`!:d<%lO!9[a!:TT!a`{POr)esv)ew;'S)e;'S;=`)y<%lO)ea!:gP;=`<%l!9[!R!:sV!a`!cp{POr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!;]P;=`<%l!6qT!;ebhSOq!8Sqr!;`rs!8Ssw!;`wx!8Sx!P!;`!P!Q!8S!Q!_!;`!_!`!8S!`!a!8f!a#s!;`#s$f!8S$f;'S!;`;'S;=`!<m<%l?Ah!;`?Ah?BY!8S?BY?Mn!;`?MnO!8ST!<pP;=`<%l!;`!V!<vP;=`<%l!5]!V!=SdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a#c1n#c#d!>b#d#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!>kdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a#V1n#V#W!?y#W#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!@SdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a#h1n#h#i!Ab#i#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!AkdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a#m1n#m#n!By#n#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!CSdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a#d1n#d#e!Db#e#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!DkdhS!a`!cpOq*Vqr1nrs(Vsv1nvw0pwx)ex!P1n!P!Q*V!Q!_1n!_!a*V!a#X1n#X#Y!5]#Y#s1n#s$f*V$f;'S1n;'S;=`3P<%l?Ah1n?Ah?BY*V?BY?Mn1n?MnO*V!V!FSchS!a`!cpOq!G_qr!Eyrs!HUsv!Eyvw!Ncwx!Jvx!P!Ey!P!Q!G_!Q!_!Ey!_!a!G_!a!b##T!b#s!Ey#s$f!G_$f;'S!Ey;'S;=`#$i<%l?Ah!Ey?Ah?BY!G_?BY?Mn!Ey?MnO!G_!R!GfY!a`!cpOr!G_rs!HUsv!G_vw!Hpwx!Jvx!a!G_!a!b!Lv!b;'S!G_;'S;=`!N]<%lO!G_q!HZV!cpOv!HUvx!Hpx!a!HU!a!b!Iq!b;'S!HU;'S;=`!Jp<%lO!HUP!HsTO!a!Hp!a!b!IS!b;'S!Hp;'S;=`!Ik<%lO!HpP!IVTO!`!Hp!`!a!If!a;'S!Hp;'S;=`!Ik<%lO!HpP!IkOxPP!InP;=`<%l!Hpq!IvV!cpOv!HUvx!Hpx!`!HU!`!a!J]!a;'S!HU;'S;=`!Jp<%lO!HUq!JdS!cpxPOv(Vx;'S(V;'S;=`(h<%lO(Vq!JsP;=`<%l!HUa!J{X!a`Or!Jvrs!Hpsv!Jvvw!Hpw!a!Jv!a!b!Kh!b;'S!Jv;'S;=`!Lp<%lO!Jva!KmX!a`Or!Jvrs!Hpsv!Jvvw!Hpw!`!Jv!`!a!LY!a;'S!Jv;'S;=`!Lp<%lO!Jva!LaT!a`xPOr)esv)ew;'S)e;'S;=`)y<%lO)ea!LsP;=`<%l!Jv!R!L}Y!a`!cpOr!G_rs!HUsv!G_vw!Hpwx!Jvx!`!G_!`!a!Mm!a;'S!G_;'S;=`!N]<%lO!G_!R!MvV!a`!cpxPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!N`P;=`<%l!G_T!NhbhSOq!Hpqr!Ncrs!Hpsw!Ncwx!Hpx!P!Nc!P!Q!Hp!Q!_!Nc!_!a!Hp!a!b# p!b#s!Nc#s$f!Hp$f;'S!Nc;'S;=`#!}<%l?Ah!Nc?Ah?BY!Hp?BY?Mn!Nc?MnO!HpT# ubhSOq!Hpqr!Ncrs!Hpsw!Ncwx!Hpx!P!Nc!P!Q!Hp!Q!_!Nc!_!`!Hp!`!a!If!a#s!Nc#s$f!Hp$f;'S!Nc;'S;=`#!}<%l?Ah!Nc?Ah?BY!Hp?BY?Mn!Nc?MnO!HpT##QP;=`<%l!Nc!V##^chS!a`!cpOq!G_qr!Eyrs!HUsv!Eyvw!Ncwx!Jvx!P!Ey!P!Q!G_!Q!_!Ey!_!`!G_!`!a!Mm!a#s!Ey#s$f!G_$f;'S!Ey;'S;=`#$i<%l?Ah!Ey?Ah?BY!G_?BY?Mn!Ey?MnO!G_!V#$lP;=`<%l!Ey!V#$zXiS`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X",tokenizers:[scriptTokens,styleTokens,textareaTokens,endTag,tagStart,commentContent,0,1,2,3,4,5],topRules:{Document:[0,15]},dialects:{noMatch:0,selfClosing:485},tokenPrec:487});function getAttrs(e,O){let t=Object.create(null);for(let n of e.getChildren(23)){let e=n.getChild(24),a=n.getChild(26)||n.getChild(27);e&&(t[O.read(e.from,e.to)]=a?26==a.type.id?O.read(a.from+1,a.to-1):O.read(a.from,a.to):"")}return t}function findTagName(e,O){let t=e.getChild(22);return t?O.read(t.from,t.to):" "}function maybeNest(e,O,t){let n;for(let a of t)if(!a.attrs||a.attrs(n||(n=getAttrs(e.node.parent.firstChild,O))))return{parser:a.parser};return null}function configureNesting(e=[],O=[]){let t=[],n=[],a=[],r=[];for(let O of e){("script"==O.tag?t:"style"==O.tag?n:"textarea"==O.tag?a:r).push(O)}let s=O.length?Object.create(null):null;for(let e of O)(s[e.name]||(s[e.name]=[])).push(e);return parseMixed(((e,O)=>{let l=e.type.id;if(28==l)return maybeNest(e,O,t);if(31==l)return maybeNest(e,O,n);if(34==l)return maybeNest(e,O,a);if(20==l&&r.length){let t,n=e.node,a=n.firstChild,s=a&&findTagName(a,O);if(s)for(let e of r)if(e.tag==s&&(!e.attrs||e.attrs(t||(t=getAttrs(n,O))))){let O=n.lastChild;return{parser:e.parser,overlay:[{from:a.to,to:37==O.type.id?O.from:n.to}]}}}if(s&&23==l){let t,n=e.node;if(t=n.firstChild){let e=s[O.read(t.from,t.to)];if(e)for(let t of e){if(t.tagName&&t.tagName!=findTagName(n.parent,O))continue;let e=n.lastChild;if(26==e.type.id){let O=e.from+1,n=e.lastChild,a=e.to-(n&&n.isError?0:1);if(a>O)return{parser:t.parser,overlay:[{from:O,to:a}]}}else if(27==e.type.id)return{parser:t.parser,overlay:[{from:e.from,to:e.to}]}}}}return null}))}export{configureNesting,parser};