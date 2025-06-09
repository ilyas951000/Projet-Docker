"use client"
import React from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// Corrige les icônes Leaflet pour Next.js
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

interface IPackage {
  id: number
  packageName: string
  currentLatitude?: number
  currentLongitude?: number
  destinationLatitude?: number
  destinationLongitude?: number
}

interface Props {
  packages: IPackage[]
  className?: string
}

const PackageMap: React.FC<Props> = ({ packages, className = "" }) => {
  const defaultCenter: [number, number] = [48.8566, 2.3522] // Paris par défaut

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {packages.map((pkg) => {
          const start: [number, number] | null =
            pkg.currentLatitude && pkg.currentLongitude ? [pkg.currentLatitude, pkg.currentLongitude] : null
          const end: [number, number] | null =
            pkg.destinationLatitude && pkg.destinationLongitude
              ? [pkg.destinationLatitude, pkg.destinationLongitude]
              : null

          return (
            <React.Fragment key={pkg.id}>
              {start && (
                <Marker position={start}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">Départ : {pkg.packageName}</p>
                      <p className="text-gray-500">Colis #{pkg.id}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {end && (
                <Marker position={end}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">Arrivée : {pkg.packageName}</p>
                      <p className="text-gray-500">Colis #{pkg.id}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {start && end && <Polyline positions={[start, end]} color="#3b82f6" weight={3} opacity={0.7} />}
            </React.Fragment>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default PackageMap
