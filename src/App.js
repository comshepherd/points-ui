import "./styles.css";
import "leaflet/dist/leaflet.css";
import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";

import {divIcon, Icon, point} from "leaflet";
import {useEffect, useState} from "react";

const customIcon = new Icon({
    iconUrl: require("./icons/placeholder.png"),
    iconSize: [38, 38]
});

const customClusterIcon = new Icon({
    iconUrl: require("./icons/cluster.png"),
    iconSize: [19, 19]
});

// const createClusterCustomIcon = function (cluster) {
//     return divIcon({
//         html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
//         className: "custom-marker-cluster",
//         iconSize: point(33, 33, true)
//     });
// };

const FetchClusters = () => {
    const [clusters, setClusters] = useState([]);
    const map = useMap();

    useEffect(() => {
        const fetchClusters = async () => {
            let page = 1;
            const pageSize = 1000;
            let allClusters = [];
            let hasMore = true;

            const bounds = map.getBounds();
            const south = bounds.getSouth();
            const north = bounds.getNorth();
            const west = bounds.getWest();
            const east = bounds.getEast();
            const zoom = map.getZoom()

            while (hasMore) {
                const url = `http://localhost:8080/api/v1/clusters?page=${page}&pageSize=${pageSize}&east=${east}&west=${west}&north=${north}&south=${south}&zoom=${zoom}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.clusters) {
                    allClusters = [...clusters, ...data.clusters];
                    hasMore = data.hasMore;
                    page += 1;
                } else {
                    hasMore = false
                }
            }
            setClusters(allClusters);
        };

        map.on('moveend', fetchClusters);

        fetchClusters();

        return () => {
            map.off('moveend', fetchClusters);
        };
    }, [map]);

    return (
        <>
            {clusters.map((cluster, index) => (
                <Marker key={index}
                        position={[cluster.latitude, cluster.longitude]}
                        icon={customClusterIcon}>
                    <Popup>
                        points = {cluster.pointsQty}
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

export default function App() {
    return (
        <MapContainer center={[55.7558, 37.6173]}
                      zoom={13}>
            <TileLayer
                detectRetina={true}
                attribution="Google Maps"
                url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" // regular
                // url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" // satellite
                // url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" // terrain
                maxZoom={20}
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
            />
            <FetchClusters/>
        </MapContainer>
    );
}
