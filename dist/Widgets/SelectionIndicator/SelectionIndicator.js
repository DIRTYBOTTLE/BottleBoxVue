import defined from"../../Core/defined.js";import destroyObject from"../../Core/destroyObject.js";import DeveloperError from"../../Core/DeveloperError.js";import knockout from"../../ThirdParty/knockout.js";import getElement from"../getElement.js";import SelectionIndicatorViewModel from"./SelectionIndicatorViewModel.js";function SelectionIndicator(e,t){if(!defined(e))throw new DeveloperError("container is required.");e=getElement(e),this._container=e;const o=document.createElement("div");o.className="cesium-selection-wrapper",o.setAttribute("data-bind",'style: { "top" : _screenPositionY, "left" : _screenPositionX },css: { "cesium-selection-wrapper-visible" : isVisible }'),e.appendChild(o),this._element=o;const i="http://www.w3.org/2000/svg",n="M -34 -34 L -34 -11.25 L -30 -15.25 L -30 -30 L -15.25 -30 L -11.25 -34 L -34 -34 z M 11.25 -34 L 15.25 -30 L 30 -30 L 30 -15.25 L 34 -11.25 L 34 -34 L 11.25 -34 z M -34 11.25 L -34 34 L -11.25 34 L -15.25 30 L -30 30 L -30 15.25 L -34 11.25 z M 34 11.25 L 30 15.25 L 30 30 L 15.25 30 L 11.25 34 L 34 34 L 34 11.25 z",r=document.createElementNS(i,"svg:svg");r.setAttribute("width",160),r.setAttribute("height",160),r.setAttribute("viewBox","0 0 160 160");const s=document.createElementNS(i,"g");s.setAttribute("transform","translate(80,80)"),r.appendChild(s);const c=document.createElementNS(i,"path");c.setAttribute("data-bind","attr: { transform: _transform }"),c.setAttribute("d",n),s.appendChild(c),o.appendChild(r);const d=new SelectionIndicatorViewModel(t,this._element,this._container);this._viewModel=d,knockout.applyBindings(this._viewModel,this._element)}Object.defineProperties(SelectionIndicator.prototype,{container:{get:function(){return this._container}},viewModel:{get:function(){return this._viewModel}}}),SelectionIndicator.prototype.isDestroyed=function(){return!1},SelectionIndicator.prototype.destroy=function(){const e=this._container;return knockout.cleanNode(this._element),e.removeChild(this._element),destroyObject(this)};export default SelectionIndicator;