# Movie-Control  
브라우저마다 같은 동영상 컨트롤 UI를 적용합니다.
  
[DEMO](https://hyunjin912.github.io/movie-control)  

![스크린샷](/screenshots/screenshot-01.png)

## 사용법
```html
<video class="v1">
  <source src="src/video.mp4" type="video/mp4">
</video>
```
```javascript
document.querySelector('.v1').setControl();
```
  
## 옵션 
- width - 비디오 태그의 너비(기본: 100%)
- height - 비디오 태그의 높이(기본: auto)
- start - 시작할 시간(초), 설정 버튼으로 적용 가능
- end - 종료할 시간(초), 설정 버튼으로 적용 가능
- color
  - button - 버튼 색상
  - background - 컨트롤러의 배경 색상

```javascript
interface VidOption {
  width: string,
  height: string,
  start: string | number,
  end: string | number,
  color: {
    button: string,
    background: string
  }
}
const opt = {} as VidOption;

document.querySelector('.v1').setControl(opt);
```
