# Methodology: DRC Wildfire Index Evaluation

## Introduction

The DRC Wildfire Index is a composite risk assessment tool that quantifies the spatial distribution of wildfire susceptibility across the Democratic Republic of the Congo. This index integrates multiple environmental and anthropogenic factors—including historical fire frequency, fire weather conditions (land surface temperature), vegetation status, population density, and terrain characteristics—into a single normalized scale ranging from 0 (low risk) to 1 (high risk). The index is important because it provides decision-makers, land managers, and emergency response agencies with a spatially explicit, data-driven framework for identifying areas most vulnerable to wildfires, enabling proactive resource allocation, early warning systems, and targeted fire prevention strategies. This tool is particularly needed in the DRC context, where limited ground-based monitoring infrastructure and vast geographic extent make satellite-based risk assessment essential for effective fire management. In this study, the index was calculated using a weighted linear combination approach, where each contributing factor (normalized to 0-1 scale) was multiplied by its respective weight (historical fires: 25%, fire weather: 25%, vegetation: 20%, population: 15%, terrain slope: 15%) and summed to produce the final wildfire risk score. The methodology leverages freely available NASA Earth observation data from MODIS sensors and SRTM elevation data, processed using open-source geospatial tools to ensure reproducibility and transparency.

## Overview

This document describes the step-by-step methodology for evaluating wildfire risk in the Democratic Republic of the Congo (DRC) using Earth observation data from NASA Earthdata sources.

## 1. Study Area

**Location**: Democratic Republic of the Congo (DRC)  
**Geographic Extent**: 
- Longitude: 12.20°E to 31.31°E
- Latitude: -13.45°S to 5.39°N
- Area: ~2,345,409 km²

**Boundary Source**: GADM (Global Administrative Areas) database, version 4.1

## 2. Data Sources and Acquisition

### 2.1 Administrative Boundary

**Source**: GADM (Global Administrative Areas)  
**Product**: gadm41_COD.gpkg  
**Resolution**: Administrative level 0 (country boundary)  
**Format**: GeoPackage  
**Download Method**: Direct download from GADM repository  
**URL**: https://gadm.org

### 2.2 Historical Fire Frequency

**Source**: NASA LP DAAC  
**Product**: MODIS Burned Area (MCD64A1), Collection 6.1  
**Resolution**: 500 m  
**Temporal Coverage**: 2020-2023  
**Temporal Resolution**: Monthly  
**Band Used**: Burn Date  
**Download Method**: NASA CMR (Common Metadata Repository) API  
**Processing**: 
- Query CMR for granules covering DRC bounding box
- Download HDF files for relevant tiles (h19v08-h21v10)
- Extract Burn Date band using GDAL
- Mosaic tiles for each time period
- Calculate fire frequency (number of burn events per pixel)
- Clip to DRC boundary

**Reference**: Giglio et al. (2018) - MODIS Collection 6 burned area product

### 2.3 Fire Weather Index

**Source**: NASA LP DAAC  
**Product**: MODIS Land Surface Temperature (MOD11A2), Collection 6.1  
**Resolution**: 1 km  
**Temporal Coverage**: 2020-2023  
**Temporal Resolution**: 8-day composite  
**Band Used**: LST_Day_1km  
**Scale Factor**: 0.02 (to convert to Kelvin)  
**Proxy Rationale**: High land surface temperature correlates with fire weather conditions  
**Download Method**: NASA CMR API  
**Processing**:
- Query and download MOD11A2 granules
- Extract LST_Day_1km band
- Apply scale factor
- Calculate mean LST over time period
- Clip to DRC boundary

**Reference**: Wan et al. (2015) - MODIS Land Surface Temperature products

### 2.4 Vegetation Index

**Source**: NASA LP DAAC  
**Product**: MODIS Vegetation Indices (MOD13A2), Collection 6.1  
**Resolution**: 1 km  
**Temporal Coverage**: 2019-2023  
**Temporal Resolution**: 16-day composite  
**Band Used**: 250m 16 days NDVI  
**Scale Factor**: 0.0001  
**Rationale**: Low NDVI indicates sparse vegetation, which increases fire risk  
**Download Method**: NASA CMR API  
**Processing**:
- Query and download MOD13A2 granules
- Extract NDVI band
- Apply scale factor
- Calculate mean NDVI over time period
- Clip to DRC boundary

**Reference**: Didan (2015) - MODIS Vegetation Index products

### 2.5 Population Density Proxy

**Source**: NASA LP DAAC  
**Product**: MODIS Land Cover Type (MCD12Q1), Collection 6.1  
**Resolution**: 500 m  
**Temporal Coverage**: 2020-2021  
**Temporal Resolution**: Annual  
**Classification**: IGBP (International Geosphere-Biosphere Programme)  
**Class Used**: 13 (Urban and Built-up Lands)  
**Proxy Rationale**: Urban land cover indicates population density, which correlates with fire risk  
**Download Method**: NASA CMR API  
**Processing**:
- Query and download MCD12Q1 granules
- Extract LC_Type1 (IGBP classification)
- Create binary mask: Urban (class 13) = 1, Other = 0
- Calculate urban density
- Clip to DRC boundary

**Reference**: Sulla-Menashe & Friedl (2018) - MODIS Land Cover products

### 2.6 Digital Elevation Model

**Source**: NASA LP DAAC / USGS  
**Product**: SRTM (Shuttle Radar Topography Mission) Global 1 arc second  
**Resolution**: 30 m (1 arc second)  
**Coverage**: Global (60°N to 56°S)  
**Format**: HGT files  
**Download Method**: Processed existing tiles  
**Processing**:
- Mosaic 20 SRTM tiles covering DRC
- Clip to DRC boundary
- Calculate terrain slope using gradient method
- Resample to match other datasets (~1 km)

**Reference**: Farr et al. (2007) - SRTM data products

## 3. Data Processing Workflow

### Step 1: Data Download

1. **Boundary Acquisition**
   - Download DRC boundary from GADM
   - Verify geometry and CRS (EPSG:4326)
   - Simplify if necessary for processing efficiency

2. **MODIS Data Acquisition**
   - Authenticate with NASA Earthdata using token
   - Query CMR API for each MODIS product
   - Filter granules by:
     - Temporal range (2020-2023)
     - Spatial bounding box (DRC extent)
   - Download HDF files for relevant tiles

3. **SRTM Data Processing**
   - Identify required SRTM tiles for DRC
   - Process existing HGT files
   - Mosaic tiles

### Step 2: HDF File Processing

For each MODIS product:

1. **Subdataset Extraction**
   - Use GDAL (via OSGeo4W) to list subdatasets
   - Identify target band (e.g., Burn Date, LST_Day_1km)
   - Extract subdataset using `gdal_translate`

2. **Mosaicking**
   - Combine multiple tiles for same time period
   - Use `gdal_merge` or `gdalwarp` for mosaicking
   - Handle overlapping areas appropriately

3. **Clipping**
   - Clip mosaicked raster to DRC boundary
   - Use `gdalwarp` with cutline option
   - Ensure output CRS is consistent

### Step 3: Temporal Aggregation

1. **Fire Frequency** (MCD64A1)
   - Sum burn events across all time periods
   - Create frequency map (number of fires per pixel)

2. **Mean LST** (MOD11A2)
   - Calculate mean LST across all time periods
   - Convert to Celsius if needed

3. **Mean NDVI** (MOD13A2)
   - Calculate mean NDVI across all time periods
   - Filter invalid values (typically < -0.2)

4. **Urban Density** (MCD12Q1)
   - Use most recent year available
   - Calculate density of urban pixels

5. **Terrain Slope** (SRTM)
   - Calculate slope using gradient method
   - Formula: slope = √(dx² + dy²)

### Step 4: Reprojection and Resampling

1. **Reproject to WGS84**
   - All MODIS products use Sinusoidal projection
   - Reproject all rasters to EPSG:4326 (WGS84)
   - Use bilinear resampling for continuous data
   - Use nearest neighbor for categorical data

2. **Resample to Common Resolution**
   - Target resolution: ~1 km (0.01 degrees)
   - Use reference raster (NDVI) as template
   - Resample all other rasters to match

### Step 5: Normalization

For each raster component:

1. **Mask Invalid Values**
   - Remove NoData values
   - Filter fill values (e.g., -3000 for MODIS)
   - Handle outliers

2. **Normalize to 0-1 Range**
   - Method: Min-Max normalization
   - Formula: normalized = (value - min) / (max - min)
   - Ensures all components are on same scale

3. **Invert NDVI**
   - Low NDVI = high fire risk
   - Formula: inverted_ndvi = 1 - normalized_ndvi

### Step 6: Index Combination

**Formula**:
```
WI = w₁×Fires + w₂×LST + w₃×(1-NDVI) + w₄×Urban + w₅×Slope
```

Where:
- WI = Wildfire Index (0-1)
- w₁ = 0.25 (Historical fires)
- w₂ = 0.25 (Fire weather/LST)
- w₃ = 0.20 (Vegetation, inverted)
- w₄ = 0.15 (Population/urban)
- w₅ = 0.15 (Terrain slope)

**Weights sum to 1.0** and are based on:
- Literature review of wildfire risk factors
- Data availability and quality
- Expert judgment

**Processing**:
1. Multiply each normalized component by its weight
2. Sum weighted components
3. Normalize final index to 0-1 range
4. Handle any remaining NoData values

### Step 7: Output Generation

1. **GeoTIFF Export**
   - Save as GeoTIFF format
   - CRS: EPSG:4326 (WGS84)
   - Compression: LZW
   - NoData: NaN

2. **Metadata**
   - Include processing date
   - List all input datasets
   - Document weights used
   - Record data sources and versions

## 4. Quality Assurance

### 4.1 Data Quality Checks

- Verify all input rasters have valid data
- Check for spatial alignment
- Validate CRS consistency
- Inspect for artifacts or anomalies

### 4.2 Index Validation

- Verify index values are in expected range (0-1)
- Check for reasonable spatial patterns
- Compare with known fire-prone areas
- Validate against historical fire records (if available)

## 5. Limitations and Assumptions

### Limitations

1. **Temporal Coverage**: Limited to available MODIS data (2020-2023)
2. **Spatial Resolution**: ~1 km resolution may miss small-scale features
3. **Proxy Variables**: LST used as proxy for fire weather (not true FWI)
4. **Urban Proxy**: Land cover used instead of actual population data
5. **Weight Selection**: Weights based on literature but may need calibration

### Assumptions

1. Historical fire frequency predicts future risk
2. High LST indicates fire-prone conditions
3. Low NDVI indicates higher fire risk
4. Urban areas have higher fire risk
5. Steeper terrain increases fire risk

## 6. Software and Tools

- **Python 3.13**: Main programming language
- **GDAL 3.9.3**: Geospatial data processing (via OSGeo4W)
- **Rasterio**: Raster I/O and processing
- **Geopandas**: Vector data handling
- **NumPy**: Numerical computations
- **NASA CMR API**: Data discovery and download
- **OSGeo4W**: GDAL command-line tools for Windows

## 7. Output Products

1. **Wildfire Index Raster** (`wildfire_index.tif`)
   - GeoTIFF format
   - WGS84 projection
   - 0-1 risk scale

2. **Component Rasters** (individual factors)
   - Historical fires
   - Fire weather (LST)
   - Vegetation (NDVI)
   - Population (urban)
   - Terrain (slope)

3. **Interactive Map** (`wildfire_index_map.html`)
   - Web-based visualization
   - Interactive exploration
   - Risk classification

## 8. Future Enhancements

1. Include additional factors (e.g., road density, protected areas)
2. Calibrate weights using historical fire data
3. Implement temporal analysis (seasonal variations)
4. Add uncertainty quantification
5. Develop fire risk categories (low, moderate, high, very high)

