import maplibregl, { IControl } from "maplibre-gl";

export class MapControl implements IControl {
    map: maplibregl.Map | undefined;

    _container: HTMLElement;

    constructor(container: HTMLElement) {
        this._container = container;
    }

    onAdd(map: maplibregl.Map): HTMLElement {
        this.map = map;
        this._container.classList.add("maplibregl-ctrl");
        this._container.classList.remove("hidden");
        return this._container;
    }

    onRemove(): void {
        this._container.parentNode?.removeChild(this._container);
        this.map = undefined;
    }
}
