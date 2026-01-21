function Frame1() {
  return (
    <div className="absolute content-stretch flex font-['Avenir:Heavy',sans-serif] gap-[171px] items-center left-[17px] text-[12px] text-white top-[65px]">
      <p className="css-ew64yg relative shrink-0">No.</p>
      <p className="css-ew64yg relative shrink-0">Song Title</p>
      <p className="css-ew64yg relative shrink-0">BPM</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[#2dec99] content-stretch flex font-['Avenir:Heavy',sans-serif] items-center justify-between left-[calc(50%+0.5px)] overflow-clip px-[9px] py-[12px] text-[12px] text-black top-[87px] translate-x-[-50%] uppercase w-[453px]">
      <p className="css-ew64yg relative shrink-0">1.</p>
      <p className="css-ew64yg relative shrink-0">Get Back</p>
      <p className="css-ew64yg relative shrink-0">136</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[#2dd2ec] content-stretch flex font-['Avenir:Heavy',sans-serif] items-center justify-between left-[calc(50%+0.5px)] overflow-clip px-[9px] py-[12px] text-[12px] text-black top-[133px] translate-x-[-50%] uppercase w-[453px]">
      <p className="css-ew64yg relative shrink-0">1.</p>
      <p className="css-ew64yg relative shrink-0">Better Than This</p>
      <p className="css-ew64yg relative shrink-0">136</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-[#d9c3fd] content-stretch flex font-['Avenir:Heavy',sans-serif] items-center justify-between left-[calc(50%+0.5px)] overflow-clip px-[9px] py-[12px] text-[12px] text-black top-[179px] translate-x-[-50%] uppercase w-[453px]">
      <p className="css-ew64yg relative shrink-0">1.</p>
      <p className="css-ew64yg relative shrink-0">THANK YOU FOR BEING A FRIEND</p>
      <p className="css-ew64yg relative shrink-0">136</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-[#ffe761] content-stretch flex font-['Avenir:Heavy',sans-serif] items-center justify-between left-[calc(50%+0.5px)] overflow-clip px-[9px] py-[12px] text-[12px] text-black top-[225px] translate-x-[-50%] uppercase w-[453px]">
      <p className="css-ew64yg relative shrink-0">1.</p>
      <p className="css-ew64yg relative shrink-0">ANNALISE</p>
      <p className="css-ew64yg relative shrink-0">136</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute bg-[#fc9494] content-stretch flex font-['Avenir:Heavy',sans-serif] items-center justify-between left-[calc(50%+0.5px)] overflow-clip px-[9px] py-[12px] text-[12px] text-black top-[271px] translate-x-[-50%] uppercase w-[453px]">
      <p className="css-ew64yg relative shrink-0">1.</p>
      <p className="css-ew64yg relative shrink-0">Work HOLIDAY</p>
      <p className="css-ew64yg relative shrink-0">136</p>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="leading-[normal] not-italic relative size-full" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 486 320\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(35.75 33.55 -50.954 54.295 46.5 47)\\\'><stop stop-color=\\\'rgba(113,113,113,1)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(89,89,89,1)\\\' offset=\\\'0.25\\\'/><stop stop-color=\\\'rgba(65,65,65,1)\\\' offset=\\\'0.5\\\'/><stop stop-color=\\\'rgba(41,41,41,1)\\\' offset=\\\'0.75\\\'/><stop stop-color=\\\'rgba(29,29,29,1)\\\' offset=\\\'0.875\\\'/><stop stop-color=\\\'rgba(16,16,16,1)\\\' offset=\\\'1\\\'/></radialGradient></defs></svg>')" }}>
      <p className="absolute css-ew64yg font-['Avenir_Next:Heavy',sans-serif] left-[17px] text-[26px] text-white top-[9px]">STAGE LIST</p>
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <Frame4 />
      <Frame5 />
      <Frame6 />
    </div>
  );
}