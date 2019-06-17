import {Path} from './Path';
import * as Util from '../../core/Util';
import {toLatLng} from '../../geo/LatLng';
import {Bounds} from '../../geometry/Bounds';


//experimenting

export var PolyMarker = Path.extend({

	// @section
	options: {
		fill: true,

	},

	initialize: function (latlng, options) {
		Util.setOptions(this, options);
		this._latlng = toLatLng(latlng);
	},

	// @method setLatLng(latLng: LatLng): this
	// Sets the position of a poly marker to a new location.
	setLatLng: function (latlng) {
		this._latlng = toLatLng(latlng);
		this.redraw();
		return this.fire('move', {latlng: this._latlng});
	},

	// @method getLatLng(): LatLng
	// Returns the current geographical position of the poly marker
	getLatLng: function () {
		return this._latlng;
	},

	setStyle : function (options) {
		Path.prototype.setStyle.call(this, options);
		return this;
	},

	_project: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._updateBounds();
	},

	_updateBounds: function () {
		var w = this._clickTolerance(),
		    p = [w, w];
		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
	},

	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},

	_updatePath: function () {
		this._renderer._updatePoly(this, true);
	},
    // true for polygons not polylines

	_empty: function () {
		return !this._renderer._bounds.intersects(this._pxBounds);
	},

	// Needed by the `Canvas` renderer for interactivity
	_containsPoint: function (p) {
		return p.distanceTo(this._point) <= this._clickTolerance();
	}
});


// @factory L.polyMarker(latlng: LatLng, options?: PolyMarker options)
// Instantiates a poly marker object given a geographical point, and an optional options object.
export function polyMarker(latlng, options) {
	return new PolyMarker(latlng, options);
}
