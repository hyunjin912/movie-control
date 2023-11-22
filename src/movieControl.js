/***************************************************************************************************************
* Author : Lee
* Plugin Name : movieControl
* File Name : movieControl.js
* Version : v1.00
* Date : 2021.12.21
****************************************************************************************************************/
(function(){

	var lists = []
	var nativeMethod = HTMLElement.prototype.addEventListener;
	HTMLElement.prototype.addEventListener = function (type, listener) {
		var that = this;
		if(lists.length > 0) {
			lists.forEach(function(list, idx){
				if(list.elem == that && list.evtName == type && list.handler.name == listener.name) {
					list.elem.removeEventListener(list.evtName, list.handler);
					lists.splice(idx, 1);
				}
			});
		}
		var elem = this;
		var evtName = type;
		var handler = listener;
		var obj = {
			elem: elem,
			evtName: evtName,
			handler: handler
		}
		lists.push(obj);
		nativeMethod.call(this, type, listener);
	}

	function setVidControl(vid, opt){

		opt=opt||{};
		opt.start=opt.start||0;
		opt.end=opt.end||0;
		opt.width=opt.width||'100%';
		opt.height=opt.height||'auto';
		opt.color=opt.color||{};
		opt.color.button=opt.color.button||'#fff';
		opt.color.background=opt.color.background||'#333';

		var dur;
		var setStart;
		var setEnd;
		var isLoop = false;
		var isSetTime = false;

		// 비디오 태그의 재생할 준비를 위해 attribute를 추가. 그리고 setControl을 위해 컨트롤러 삭제
		if(vid.controls) vid.controls = false; 
		if(vid.loop) isLoop = true;
		if(!vid.muted) vid.muted = true;
		if(!vid.playsInline) vid.playsInline = true;

		// 아이폰 썸네일을 위해. 아이폰은 자동재생이 아니면 재생을 해야만 썸네일이 보인다.
		if(!vid.autoplay) {
			vid.load(); // loadeddata이벤트 내부에 사용하면 무한루프에 걸림.
		}
		
		(function(){
			// 함수 실행할때마다 컨트롤 박스 생기는걸 방지하기 위해
			if(vid.classList.value.indexOf('set_control') != -1) return;

			// video_box생성. 제이쿼리의 wrap()메서드처럼 기능하기 위해 replaceChild()사용. 꼭 자식요소가 있어야 교체할 수 있다.
			var wrap = document.createElement('div');
			wrap.setAttribute('class', 'video_box');
			wrap.innerHTML = '<span></span>';
			vid.parentNode.insertBefore(wrap, vid); // insertBefore()는 요소를 기준요소의 앞에 위치시키기 위해 사용. 부모노드.insertBefore(기준요소 앞에 위치할 요소, 기준요소) 로 작성.
			wrap.replaceChild(vid, wrap.firstChild);

			// control_box만들어서 만들어서 비디오 아래에 붙이기
			var controlBox = document.createElement('div')
			controlBox.setAttribute('class', 'control_box');
			controlBox.innerHTML = "" // 백틱을 쓰면 편하지만 백틱은 들여쓰기를 인식하기 때문에 js파일의 용량이 커질 수 있다. 지금은 만드려는 html태그들의 양이 적기 때문에 괜찮지만 양이 많다면 매우 곤란하다. 그래서 문자열로 만들어서 더해주는 형식으로 하면 된다. 문자열끼리 더하면 스크립트는 한 줄로 인식하지만 개발자도구에서 보면 알아서 들여쓰기가 잘 되니 문제없다. 첫 줄에 빈 따옴표는 보기 편하기 위해 한 것 일뿐 의미는 없다.
			+"<div class='inner_ctr'>"
				+"<div class='ctr start' title='처음으로'>"
					+"<svg height='100%' width='100%' viewBox='0 0 36 36' fill='#fff'>"
						+"<path d='m 12,12 h 2 v 12 h -2 z m 3.5,6 8.5,6 V 12 z'></path>"
					+"</svg>"
				+"</div>"
				+"<div class='ctr state play' title='재생'>"
					+"<svg height='100%' width='100%' viewBox='0 0 36 36' fill='#fff'>"
						+"<path d='M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z' class='state_ico'></path>"
					+"</svg>"
				+"</div>"
				+"<div class='ctr end' title='마지막으로'>"
					+"<svg height='100%' width='100%' viewBox='0 0 36 36' fill='#fff'>"
						+"<path d='M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z'></path>"
					+"</svg>"
				+"</div>"
				+"<div class='ctr set' title='구간설정'>"
					+"<span class='alert_dot'></span>"
					+"<svg height='100%' width='100%' viewBox='0 0 36 36' fill='#fff'>"
						+"<path d='m 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z'></path>"
					+"</svg>"
				+"</div>"
				+"<div class='ctr volume' title='음량'>"
					+"<svg height='100%' width='100%' viewBox='0 0 36 36' fill='#fff'>"
						+"<path d='m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z'></path>"
					+"</svg>"
				+"</div>"
				+"<div class='time'>"
					+"<span class='current_time'>00:00</span> / <span class='total_time'>00:00</span>"
				+"</div>"
			+"</div>"
			+"<div class='inner_length'>"
				+"<div class='leng_box'>"
					+"<div class='total_length_bar'>"
						+"<div class='inner_bar'>"
							+"<div class='current_length_bar'></div>"
						+"</div>"
						+"<div class='dot_box'>"
							+"<div class='current_dot'></div>"
						+"</div>"
					+"</div>"
				+"</div>"
			+"</div>";
			
			vid.style.verticalAlign = 'top'; // 이미지처럼 살짝 여백이 생길 수 있어서 top을 적용
			wrap.appendChild(controlBox);

			// 비디오의 우클릭을 막기위해 glass_box 생성 및 비디오 위에 위치하기
			var glassBox = document.createElement('div');
			glassBox.setAttribute('class', 'glass_box');
			glassBox.innerHTML = ""
			+"<div class='change_box'>"
				+"<form>"
					+"<div class='input_box'>"
						+"<input type='text' class='change_start'>"
						+"<span class='placeholder'>시작</span>"
					+"</div>"
					+"<div class='input_box'>"
						+"<input type='text' class='change_end'>"
						+"<span class='placeholder'>끝</span>"
					+"</div>"
				+"</form>"
				+"<div class='alert_box'>"
					+"<span class='more_than_end'>시작이 끝보다 클 수 없습니다.</span>"
					+"<span class='start_equal_end'>시작과 끝은 같을 수 없습니다.</span>"
					+"<span class='more_than_dur'>끝은 총길이보다 클 수 없습니다.</span>"
					+"<span class='num_chk'>숫자만 입력해주세요.</span>"
				+"</div>"
			+"</div>"
			wrap.appendChild(glassBox);

			// 비디오의 하단마진이 있는지 확인하고 있다면 래퍼 아래에 동일하게 적용한다.
			var vidMarginBottom = window.getComputedStyle(vid).getPropertyValue('margin-bottom');
			if(parseInt(vidMarginBottom) > 0) {
				vid.style.marginBottom = 0;
				wrap.style.marginBottom = vidMarginBottom;
			}
		})()
		
		// 비디오 로드 상태가 되면 duration 할당
		vid.addEventListener('loadeddata', function(e){
			dur = this.duration;
			totalTimeElem.innerHTML = time(parseInt(dur));

			// 처음으로/마지막으로 버튼의 시간을 설정
			if(typeof opt.start !== 'number') opt.start = opt.start * 1;
			if(typeof opt.end !== 'number') opt.start = opt.start * 1;
			setStart = opt.start <= 0 || opt.start > parseInt(dur) ? 0 : parseInt(opt.start);
			setEnd = opt.end <= 0 || opt.end > dur || opt.end == parseInt(dur) || opt.end <= opt.start ? parseInt(dur) : parseInt(opt.end);
			vid.currentTime = setStart;
			progressBarMove(); // 윗 줄에서 시작점을 셋팅했으니 그 시작점으로 상태bar가 움직여야 해서 실행한 함수
		});

		// 개발자 도구에서 너비 변경을 감지했을 때 실행할 부분
		var vidWidth = vid.getBoundingClientRect().width;
		var observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
//					console.log(mutation);
//					console.log(mutation.target.parentNode);
				if(mutation.attributeName == 'style'){ // 변화감지가 'style'이면 동작하게 함
					if(vidWidth != mutation.target.getBoundingClientRect().width) { // 너비가 달라지면 동작하게 함
						mutation.target.nextSibling.style.width = mutation.target.style.width;
						progressBarMove(); // 너비가 변하면 상태bar의 비율도 다시 달라지게 함		
						vidWidth = mutation.target.getBoundingClientRect().width; // 달라진 너비를 할당함. 이것을 기준으로 너비가 달라졌는지 확인하는 용도.

						if(mutation.target.getBoundingClientRect().width <= 270) { // 뷰포트는 넓은데 사용자가 개발자 도구에서 비디오 너비를 270보다 작게했을때 스타일을 깨지지 않게 하기 위해
							innerCtrElem.style.textAlign = 'center';
							volumeElem.style.float = 'none';
							timeElem.style.float = 'none';
							timeElem.style.paddingRight = 0;
						} else {
							innerCtrElem.style.textAlign = '';
							volumeElem.style.float = '';
							timeElem.style.float = '';
							timeElem.style.paddingRight = '';
						}

						// 비디오 위에 띄울 glass_box의 크기도 비디오의 너비에 따라 달라지게 함
						var [videoElem, controlElem, glassElem] = mutation.target.parentNode.children;
						glassElem.style.right = mutation.target.parentNode.getBoundingClientRect().width - videoElem.getBoundingClientRect().width + 'px';
						glassElem.style.bottom = controlElem.getBoundingClientRect().height + 'px';
					}
				}
			});
		});

		// 감지 설정
		var config = {
			childList: true,	// 타겟의 하위 요소 추가 및 제거 감지
			attributes: true,	// 타켓의 속성 변경를 감지
			characterData: false,	// 타겟의 데이터 변경 감지
			subtree: false,	// 타겟의 자식 노드 아래로도 모두 감지
			attributeOldValue: false,	// 타겟의 속성 변경 전 속성 기록
			characterDataOldValue: false	// 타겟의 데이터 변경 전 데이터 기록
		};

		// 감지 시작
		observer.observe(vid, config);

		/* ---------- 변수 및 기능 ---------- */
		/*
			요소를 var controlBoxElem = document.querySelect('.control_box'); 이렇게 해버리면
			setControl()을 여러번 사용했더라도 처음 setControl()를 사용한 비디오의 .control_box만 찾는다.
			그렇다면 querySelectorAll은 어떨까? 결과는 이것또한 안된다.
			그래서 생각해낸 방법은 아래와 같다.
			setControl()를 사용하는 비디오가 인자로 사용되니깐
			이 인자는 setControl()를 사용할때마다 다를것이고
			이 인자를 기준으로 부모요소, 형제요소, 자식요소를 찾아서 변수로 설정하면
			클래스명이 같더라도 원하는 요소의 클래스를 찾을 수 있다.

			비구조화할당을 한 이유는 코드를 더 줄일 수 있기 때문이다. 
		*/
		var videoBoxElem = vid.parentNode;
		var [videoElem, controlBoxElem, glassElem] = vid.parentNode.children;  
		var [innerCtrElem, innerLengthElem] = controlBoxElem.children;
		var [startElem, stateElem, endElem, setElem, volumeElem, timeElem] = innerCtrElem.children;
		var alertDotElem = setElem.children[0];
		var stateIcoElem = stateElem.children[0].children[0];
		var [currentTimeElem, totalTimeElem] = timeElem.children;
		var lengBoxElem = innerLengthElem.children[0];
		var totalLengthBarElem = lengBoxElem.children[0];
		var totalLengthBarWidth = totalLengthBarElem.getBoundingClientRect().width;
		var tlbElemLeft = totalLengthBarElem.getBoundingClientRect().left;
		var [innerBarElem, dotBoxElem] = totalLengthBarElem.children;
		var currentLengthBarElem = innerBarElem.children[0];
		var currentDotElem = dotBoxElem.children[0];
		var changeBoxElem = glassElem.children[0];
		var [formElem, alertBoxElem] = changeBoxElem.children;
		var [inputBoxElem1, inputBoxElem2] = formElem.children;
		var [changeStartElem, startPlaceholderElem] = inputBoxElem1.children;
		var [changeEndElem, endPlaceholderElem] = inputBoxElem2.children;
		var [moreThanEndElem, startEqualEndElem, moreThanDurElem, numChkElem] = alertBoxElem.children;
		var stopRaf; // requestAnimationFrame() 담을 변수
		var isDrag = false; // mousemove이벤트의 트리거 역할을 하는 변수
		var isMobile = 'ontouchstart' in window;

		// button, background, width, height 스타일 적용
		videoElem.style.width = typeof opt.width == 'number' ? opt.width+='px' : opt.width;
		videoElem.style.height = typeof opt.height == 'number' ? opt.height+='px' : opt.height;
		controlBoxElem.style.backgroundColor = opt.color.background;
		startElem.children[0].style.fill = opt.color.button;
		stateElem.children[0].style.fill = opt.color.button;
		endElem.children[0].style.fill = opt.color.button;
		setElem.children[1].style.fill = opt.color.button;
		alertDotElem.style.background = opt.color.button;
		volumeElem.children[0].style.fill = opt.color.button;
		timeElem.style.color = opt.color.button;
		currentLengthBarElem.style.backgroundColor = opt.color.button;
		currentDotElem.style.backgroundColor = opt.color.button;
		glassElem.style.right = videoBoxElem.getBoundingClientRect().width - videoElem.getBoundingClientRect().width + 'px';
		glassElem.style.bottom = controlBoxElem.getBoundingClientRect().height + 'px';
		changeStartElem.style.color = opt.color.button;
		changeStartElem.style.background = opt.color.background;
		startPlaceholderElem.style.color = opt.color.button;
		changeEndElem.style.color = opt.color.button;
		changeEndElem.style.background = opt.color.background;
		endPlaceholderElem.style.color = opt.color.button;
		alertBoxElem.style.color = opt.color.button;

		// 재생/일시정시 아이콘 변경 기능
		function updateIcon() {
			if(videoElem.paused) {
				stateIcoElem.setAttribute('d', 'M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z');
				stateElem.classList.remove('pause');
				stateElem.classList.add('play');
				stateElem.title = '재생';
			} else {
				stateIcoElem.setAttribute('d', 'M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z');
				stateElem.classList.remove('play');
				stateElem.classList.add('pause');
				stateElem.title = '일시중지';
			}
		}

		// 비디오의 재생 및 일시정지 기능
		function togglePlay() {
			if(videoElem.paused) {
				if(videoElem.ended || parseInt(videoElem.currentTime) >= parseInt(setEnd)) {
					videoElem.currentTime = setStart;
				}
				videoElem.play();
			} else {
				videoElem.pause();
			}
			currentTimeElem.innerHTML = time(videoElem.currentTime);
			updateIcon();
		}

		// 비디오의 현재 재생시간에 따른 상태표시bar
		function progressBarMove() {
			tlbElemLeft = totalLengthBarElem.getBoundingClientRect().left;
			totalLengthBarWidth = totalLengthBarElem.getBoundingClientRect().width;
			
			var moveRatio = Math.floor((videoElem.currentTime / parseInt(dur)) * totalLengthBarWidth);
			var xPos = -Math.floor(totalLengthBarWidth - moveRatio);
			if(videoElem.paused && videoElem.currentTime >= parseInt(dur)) {
				xPos = 0;
			}
			currentTimeElem.innerHTML = time(videoElem.currentTime);
			currentLengthBarElem.style.transform = 'translateX(' + xPos + 'px)';
			dotBoxElem.style.transform = 'translate(' + moveRatio + 'px, -50%)';
		}

		// 상태표시bar를 클릭했을 때 비디오의 이동을 위한 기능
		function videoMove(e) {
			var clickPos;
			if(isMobile) {
				clickPos = Math.ceil(Math.min(Math.max(0, e.touches[0].clientX - tlbElemLeft), totalLengthBarWidth));
			} else if(e.type == 'mousedown' || e.type == 'mousemove') {
				clickPos = Math.ceil(Math.min(Math.max(0, e.clientX - tlbElemLeft), totalLengthBarWidth));
			}
			var movePos = (clickPos / totalLengthBarWidth) * parseInt(dur);
			videoElem.currentTime = movePos < setStart ? setStart : movePos > setEnd ? setEnd : movePos;
		}

		// 비디오의 재생/일시정지 상태를 파악하여 아이콘과 상태표시bar를 동작시키는 기능
		var clearLoop;
		function currentTimeDetect() {
			if(videoElem.paused) {
				cancelAnimationFrame(stopRaf);
			} else {
				currentTimeElem.innerHTML = time(parseInt(videoElem.currentTime));
				stopRaf = requestAnimationFrame(currentTimeDetect);
			}

			if(videoElem.currentTime >= parseInt(setEnd)) {
				if(isLoop) {
					clearTimeout(clearLoop);
					videoElem.currentTime = parseInt(setStart);
					cancelAnimationFrame(stopRaf); 
					clearLoop = setTimeout(function(){ // ios에서 setEnd에서 끝나고 setStart로 다시 돌아가면 상태bar가 움찔거리는 현상을 해결하기 위해 setStart가 할당된 후에 requestAnimationFrame()을 조금 나중에 실행시켜서 해결함.
						stopRaf = requestAnimationFrame(currentTimeDetect);
					}, 500);
					
				} else {
					videoElem.pause();
					cancelAnimationFrame(stopRaf); // ended이벤트 2번 동작 막기 위해
					var event = new Event('ended');
					videoElem.dispatchEvent(event);
				}
			}
			updateIcon();
			progressBarMove();
		}

		function toggleMute() {
			if(videoElem.muted) {
				videoElem.muted = false;
				this.children[0].children[0].setAttribute('d', 'M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z');
			} else {
				videoElem.muted = true;
				this.children[0].children[0].setAttribute('d', 'm 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z');
			}
		}

		function setBtns(e) {
			console.log(setStart, setEnd);
			if(e.target.closest('.start') == startElem || e.target == startElem) {
				videoElem.currentTime = parseInt(setStart);
			} else {
				videoElem.currentTime = parseInt(setEnd);
			}
			progressBarMove();
		}

		function videoEnd() {
			console.log('비디오가 끝났습니다');
		}

		function contResize() {
			progressBarMove();

			if(videoElem.getBoundingClientRect().width <= 270) {
				innerCtrElem.style.textAlign = 'center';
				volumeElem.style.float = 'none';
				timeElem.style.float = 'none';
				timeElem.style.paddingRight = 0;
			} else {
				innerCtrElem.style.textAlign = '';
				volumeElem.style.float = '';
				timeElem.style.float = '';
				timeElem.style.paddingRight = '';
			}

			glassElem.style.right = videoBoxElem.getBoundingClientRect().width - videoElem.getBoundingClientRect().width + 'px';
			glassElem.style.bottom = controlBoxElem.getBoundingClientRect().height + 'px';
		}

		function pointerStart(e) {
			if(isMobile) {
				videoMove(e);
				this.classList.add('show');
				progressBarMove();
			} else {
				videoMove(e);
				isDrag = true;
				this.classList.add('show');
				progressBarMove();
			}
		}

		function pointerMove(e) {
			if(isMobile){
				if(e.cancelable) e.preventDefault(); // 모바일(특히 ios)에서 터치무브로 인한 스크롤을 방지하기 위해. 이벤트의 기본기능을 취소할 수 있는지의 여부를 확인하고, 가능하다면 기본기능을 취소하기. 터치이벤트를 막아서 스크롤을 막으면 에러가 뜰 수 있기 때문.
				videoMove(e);
				progressBarMove();
			} else {
				if(!isDrag) return;
				videoMove(e);
				progressBarMove();
			}
		}

		function pointerEnd(e) {
			if(isMobile) {
				isDrag = false;
				lengBoxElem.classList.remove('show');
			} else {
				if(!isDrag) return;
				isDrag = false;
				lengBoxElem.classList.remove('show');
			}
		}

		function timeSync() {
			if(videoElem.currentTime == parseInt(setStart) || videoElem.currentTime == parseInt(setEnd)) {
				progressBarMove();
				return;
			}	
			if(videoElem.currentTime < parseInt(setStart)) {
				videoElem.currentTime = parseInt(setStart);
				console.warn('start속성의 제한으로 인해 currentTime은 ' + parseInt(setStart) + '보다 작을 수 없습니다.');
			} else if(videoElem.currentTime > parseInt(setEnd)) {
				videoElem.currentTime = parseInt(setEnd);
				console.warn('end속성의 제한으로 인해 currentTime은 ' + parseInt(setEnd) + '보다 클 수 없습니다.');
			}
			progressBarMove();
		}

		function hiddenChangeBox(e) {
			e.stopPropagation();
			if( e.target == formElem // form
				|| e.target == inputBoxElem1 // .changeStart
				|| e.target == changeStartElem // .changeStart
				|| e.target == startPlaceholderElem // .changeStart
				|| e.target == inputBoxElem2 // .changeEnd 
				|| e.target == changeEndElem // .changeEnd 
				|| e.target == endPlaceholderElem // .changeEnd 
				|| moreThanEndElem.className.indexOf('alert') != -1 // 경고(시작 > 끝)
				|| startEqualEndElem.className.indexOf('alert') != -1 // 경고(시작 == 끝)
				|| moreThanDurElem.className.indexOf('alert') != -1 // 경고(시작 > dur || 끝 > dur)
				|| numChkElem.className.indexOf('alert') != -1 // 경고(숫자확인)
			) {
				return;
			}
			changeBoxElem.classList.remove('on');
		}

		function toggleChangeBox() {
			if(changeBoxElem.className.indexOf('on') == -1) {
				changeBoxElem.classList.add('on');	
			} else {
				if(moreThanEndElem.className.indexOf('alert') != -1
				|| startEqualEndElem.className.indexOf('alert') != -1
				|| moreThanDurElem.className.indexOf('alert') != -1
				|| numChkElem.className.indexOf('alert') != -1
				) {
					alertDotElem.classList.add('on');
				}
				changeBoxElem.classList.remove('on');
			}
		}

		function changeValue(e) {
			var reg = /[^\d]/g;
			if(reg.test(changeStartElem.value) || reg.test(changeEndElem.value)) {
				moreThanEndElem.classList.remove('alert');
				startEqualEndElem.classList.remove('alert');
				moreThanDurElem.classList.remove('alert');
				numChkElem.classList.add('alert');
				return;
			} else {
				var start = changeStartElem.value == '' ? parseInt(setStart) : parseInt(changeStartElem.value);
				var	end = changeEndElem.value == '' ? parseInt(setEnd) : parseInt(changeEndElem.value);

				numChkElem.classList.remove('alert');
				if(start > end) {
					startEqualEndElem.classList.remove('alert');
					moreThanDurElem.classList.remove('alert');
					moreThanEndElem.classList.add('alert');
					return;
				} else if(start == end) {
					moreThanEndElem.classList.remove('alert');
					moreThanDurElem.classList.remove('alert');
					startEqualEndElem.classList.add('alert');	
				} else if(start > parseInt(videoElem.duration) || end > parseInt(videoElem.duration)) {
					moreThanEndElem.classList.remove('alert');
					startEqualEndElem.classList.remove('alert');
					moreThanDurElem.classList.add('alert');
				} else {
					moreThanEndElem.classList.remove('alert');
					startEqualEndElem.classList.remove('alert');
					moreThanDurElem.classList.remove('alert');

					alertDotElem.classList.remove('on');

					setStart = start;
					setEnd = end;
					videoElem.currentTime = setStart;
				}
			}
		}

		function inputFocus(e) {
			e.target.previousSibling.focus();
		}

		function togglePlaceholder(e) {
			if(e.type == 'focus') {
				e.target.nextSibling.style.display = 'none'
			} else { // blur
				if(e.target.value == '') {
					e.target.nextSibling.style.display = 'block';
				} else {
					e.target.nextSibling.style.display = 'none';
				}
			}
		}

		/* ---------- 이벤트 설정 ---------- */
		stateElem.addEventListener('click', togglePlay);
		glassElem.addEventListener('click', togglePlay);
		setElem.addEventListener('click', toggleChangeBox);
		changeBoxElem.addEventListener('click', hiddenChangeBox);
		formElem.addEventListener('change', changeValue);
		changeStartElem.addEventListener('focus', togglePlaceholder);
		changeStartElem.addEventListener('blur', togglePlaceholder);
		startPlaceholderElem.addEventListener('click', inputFocus);
		changeEndElem.addEventListener('focus', togglePlaceholder);
		changeEndElem.addEventListener('blur', togglePlaceholder);
		endPlaceholderElem.addEventListener('click', inputFocus);
		volumeElem.addEventListener('click', toggleMute);
		startElem.addEventListener('click', setBtns);
		endElem.addEventListener('click', setBtns);
		videoElem.addEventListener('play', currentTimeDetect);
		videoElem.addEventListener('ended', videoEnd);
		videoElem.addEventListener('seeking', timeSync);
		window.addEventListener('resize', contResize);
		
		// 터치 가능 유무에 따른 이벤트 분기
		if(isMobile) {
			lengBoxElem.addEventListener('touchstart', pointerStart);
			lengBoxElem.addEventListener('touchmove', pointerMove);
			lengBoxElem.addEventListener('touchend', pointerEnd);

		} else {
			lengBoxElem.addEventListener('mousedown', pointerStart);
			window.addEventListener('mousemove', pointerMove);
			window.addEventListener('mouseup', pointerEnd);
		}
		
		/* ---------- 클래스로 setControl() 사용 유무 판별 ---------- */
		vid.classList.add('set_control');
	}
	
	// duration과 currentTime의 단위를 초로 바꾸기 위한 기능
	function time(seconds) {
		var hour = seconds/3600 < 10 ? '0'+ parseInt(seconds/3600) : parseInt(seconds/3600);
		var min = (seconds%3600)/60 < 10 ? '0'+ parseInt((seconds%3600)/60) : parseInt((seconds%3600)/60);
		var sec = Math.round(seconds % 60) < 10 ? '0'+ Math.round(seconds % 60) : Math.round(seconds % 60);

		if(hour === '00') {
			return min + ":" + sec;
		} else {
			return hour + ":" + min + ":" + sec;
		}
	}

	HTMLElement.prototype.setControl = function(opt){
		if(this.nodeName !== 'VIDEO') return;
		setVidControl(this, opt);
	}
})()
