!function(t){function i(){this.months=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"],this.notKey=[",","{","}"," ","="],this.pos=0,this.input="",this.entries=new Array,this.currentEntry="",this.setInput=function(t){this.input=t},this.getEntries=function(){return this.entries},this.isWhitespace=function(t){return" "==t||"\r"==t||"	"==t||"\n"==t},this.match=function(t,i){if(void 0!=i&&null!=i||(i=!0),this.skipWhitespace(i),this.input.substring(this.pos,this.pos+t.length)!=t)throw"Token mismatch, expected "+t+", found "+this.input.substring(this.pos);this.pos+=t.length,this.skipWhitespace(i)},this.tryMatch=function(t,i){return void 0!=i&&null!=i||(canComment=!0),this.skipWhitespace(i),this.input.substring(this.pos,this.pos+t.length)==t},this.matchAt=function(){for(;this.input.length>this.pos&&"@"!=this.input[this.pos];)this.pos++;return"@"==this.input[this.pos]},this.skipWhitespace=function(t){for(;this.isWhitespace(this.input[this.pos]);)this.pos++;if("%"==this.input[this.pos]&&1==t){for(;"\n"!=this.input[this.pos];)this.pos++;this.skipWhitespace(t)}},this.value_braces=function(){var t=0;this.match("{",!1);for(var i=this.pos,s=!1;;){if(!s)if("}"==this.input[this.pos]){if(!(t>0)){var n=this.pos;return this.match("}",!1),this.input.substring(i,n)}t--}else if("{"==this.input[this.pos])t++;else if(this.pos>=this.input.length-1)throw"Unterminated value";"\\"==this.input[this.pos]&&0==s,this.pos++}},this.value_comment=function(){for(var t="",i=0;!this.tryMatch("}",!1)||0!=i;){if(t+=this.input[this.pos],"{"==this.input[this.pos]&&i++,"}"==this.input[this.pos]&&i--,this.pos>=this.input.length-1)throw"Unterminated value:"+this.input.substring(start);this.pos++}return t},this.value_quotes=function(){this.match('"',!1);for(var t=this.pos,i=!1;;){if(!i){if('"'==this.input[this.pos]){var s=this.pos;return this.match('"',!1),this.input.substring(t,s)}if(this.pos>=this.input.length-1)throw"Unterminated value:"+this.input.substring(t)}"\\"==this.input[this.pos]&&0==i,this.pos++}},this.single_value=function(){var t=this.pos;if(this.tryMatch("{"))return this.value_braces();if(this.tryMatch('"'))return this.value_quotes();var i=this.key();if(i.match("^[0-9]+$"))return i;if(this.months.indexOf(i.toLowerCase())>=0)return i.toLowerCase();throw"Value expected:"+this.input.substring(t)+" for key: "+i},this.value=function(){var t=[];for(t.push(this.single_value());this.tryMatch("#");)this.match("#"),t.push(this.single_value());return t.join("")},this.key=function(){for(var t=this.pos;;){if(this.pos>=this.input.length)throw"Runaway key";if(this.notKey.indexOf(this.input[this.pos])>=0)return this.input.substring(t,this.pos);this.pos++}},this.key_equals_value=function(){var t=this.key();if(this.tryMatch("=")){this.match("=");var i=this.value();return[t,i]}throw"... = value expected, equals sign missing:"+this.input.substring(this.pos)},this.key_value_list=function(){var t=this.key_equals_value();for(this.currentEntry.entryTags={},this.currentEntry.entryTags[t[0]]=t[1];this.tryMatch(",")&&(this.match(","),!this.tryMatch("}"));)t=this.key_equals_value(),this.currentEntry.entryTags[t[0]]=t[1]},this.entry_body=function(t){this.currentEntry={},this.currentEntry.citationKey=this.key(),this.currentEntry.entryType=t.substring(1),this.match(","),this.key_value_list(),this.entries.push(this.currentEntry)},this.directive=function(){return this.match("@"),"@"+this.key()},this.preamble=function(){this.currentEntry={},this.currentEntry.entryType="PREAMBLE",this.currentEntry.entry=this.value_comment(),this.entries.push(this.currentEntry)},this.comment=function(){this.currentEntry={},this.currentEntry.entryType="COMMENT",this.currentEntry.entry=this.value_comment(),this.entries.push(this.currentEntry)},this.entry=function(t){this.entry_body(t)},this.bibtex=function(){for(;this.matchAt();){var t=this.directive();this.match("{"),"@STRING"==t?this.string():"@PREAMBLE"==t?this.preamble():"@COMMENT"==t?this.comment():this.entry(t),this.match("}")}}}t.toJSON=function(t){var s=new i;return s.setInput(t),s.bibtex(),s.entries},t.toBibtex=function(t){out="";for(var i in t){if(out+="@"+t[i].entryType,out+="{",t[i].citationKey&&(out+=t[i].citationKey+", "),t[i].entry&&(out+=t[i].entry),t[i].entryTags){var s="";for(jdx in t[i].entryTags)0!=s.length&&(s+=", "),s+=jdx+"= {"+t[i].entryTags[jdx]+"}";out+=s}out+="}\n\n"}return out}}("undefined"==typeof exports?this.bibtexParse={}:exports);