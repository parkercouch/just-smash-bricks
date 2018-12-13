/* Simple JavaScript Tween v 0.2  - http://mattshaw.org/projects/simple-javascript-tweening 
 * 
 * [Arguments]
 * o: Target element
 * props: key/values object of props to tween
 * durationSecs: duration of tween in seconds (not millis)
 * onComplete: (optional) function to fire when tween is complete
 * easef: (optional) easing function
 * *** MODIFIED TO CHANGE OBJECT PROPERTIES DIRECTLY ***
 */

function tween(o,props,durationSecs,onComplete,easef){
	var fps=120,count=0,stopAt = fps*durationSecs,startVals={},endVals={},easef=easef||Quad_easeOut;
	for (var p in props) startVals[p] = o[p]; //tween_getProperty(o,p);
	for (var p in props) endVals[p] = props[p];
	var f=function(){
		count++;
		if (count>=stopAt){
			tween_stop(o);
			tween_setProps(o,endVals);
			if (onComplete) onComplete();
		} else {
			for (var p in props) {
        o[p] = easef(count,startVals[p],endVals[p]-startVals[p],stopAt);
        // tween_setProperty(o,p, easef(count,startVals[p],endVals[p]-startVals[p],stopAt) );
      }
		}
	}
	clearInterval(o._tween_int);
	o._tween_int = setInterval(f,durationSecs*1000/fps);
}
function tween_stop(o){ clearInterval(o._tween_int); }
function tween_setProps(o,props){ for (var p in props) o[p] = props[p]; }

//R.Penner Quart easing t=time,b=start,c=delta,d=duration
function Quad_easeIn (t, b, c, d) { return c*(t/=d)*t*t*t + b;}
function Quad_easeOut (t, b, c, d) {	return -c * ((t=t/d-1)*t*t*t - 1) + b;}
function Quad_easeInOut (t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t*t + b; return -c/2 * ((t-=2)*t*t*t - 2) + b; }																			
