import { useState } from 'react';
import { useTable, useSpacetimeDB } from "spacetimedb/react";
import { tables } from "../../module_bindings";
import './UserPokedex.css';

interface Plant {
    name: string;
    scientificName?: string;
    type: string;
    image: string;
    fact: string;
}

export function UserPokedexSpecificName(_: { plantName: string }) {
    // Component for displaying a specific plant detail view
}

export function UserPokedex() {
    const { getConnection } = useSpacetimeDB();
    const [uploads, uploadsReady] = useTable(tables.user_uploads);
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [loading, setLoading] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);

    if (!uploadsReady) {
        return <div className="pokedex-loading">加載中</div>;
    }

    // Transform uploads to pokedex format
    const pokedex: Record<string, Plant> = {};
    uploads.forEach((upload) => {
        if (upload.plantCorrectName && !pokedex[upload.plantCorrectName]) {
            pokedex[upload.plantCorrectName] = {
                name: upload.plantCorrectName,
                scientificName: upload.plantCorrectScientificName || '',
                type: upload.plantCorrectType || '維管植物',
                image: upload.photoBlob,
                fact: upload.plantCorrectFunFact || '',
            };
        }
    });

    const handlePlantClick = (plant: Plant) => {
        setSelectedPlant(plant);
        setLoading(true);
        fetchPlantDetails(plant);
    };

    const fetchPlantDetails = async (plant: Plant) => {
        const conn = getConnection();
        if (!conn) {
            setLoading(false);
            setDetailData(null);
            return;
        }

        try {
            const response = await conn.procedures.getPlantDetail({
                plant_name: plant.name,
                plant_scientific_name: plant.scientificName || '',
                plant_type: plant.type
            });

            if (response) {
                setDetailData({
                    flowerLanguage: response.flower_language,
                    bloomingSeason: response.blooming_season,
                    description: response.description
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('取得植物詳細資訊失敗:', error);
            setLoading(false);
            setDetailData(null);
        }
    };

    if (selectedPlant && loading) {
        return (
            <div className="plant-detail-loading">
                <div className="loading-container">
                    <div className="loading-emoji">🌿</div>
                    <h3 className="loading-title">{selectedPlant.name}</h3>
                    {selectedPlant.scientificName && (
                        <p className="loading-subtitle">{selectedPlant.scientificName}</p>
                    )}
                    <div className="loading-spinner"></div>
                    <p className="loading-text">AI 正在生成詳細資訊...</p>
                </div>
            </div>
        );
    }

    if (selectedPlant && detailData) {
        return (
            <div className="plant-detail-modal">
                <div className="plant-detail-modal-content">
                    <div className="plant-detail-modal-body">
                        <img
                            src={selectedPlant.image}
                            alt={selectedPlant.name}
                            className="plant-detail-image"
                        />
                        <h3 className="plant-detail-title">{selectedPlant.name}</h3>
                        {selectedPlant.scientificName && (
                            <p className="plant-detail-scientific-name">{selectedPlant.scientificName}</p>
                        )}

                        <div className="plant-detail-section">
                            <p className="plant-detail-section-title">植物種類</p>
                            <p className="plant-detail-section-content">{selectedPlant.type}</p>
                        </div>

                        {detailData.flowerLanguage && (
                            <div className="plant-detail-section">
                                <p className="plant-detail-section-title">花語</p>
                                <p className="plant-detail-section-content">{detailData.flowerLanguage}</p>
                            </div>
                        )}

                        <div className="plant-detail-section">
                            <p className="plant-detail-section-title">花期 / 生長季節</p>
                            <p className="plant-detail-section-content">{detailData.bloomingSeason}</p>
                        </div>

                        <div className="plant-detail-section">
                            <p className="plant-detail-section-title">簡介</p>
                            <p className="plant-detail-section-content">{detailData.description}</p>
                        </div>

                        {selectedPlant.fact && (
                            <div className="plant-detail-fact">
                                <p className="plant-detail-fact-title">小知識</p>
                                <p className="plant-detail-fact-content">{selectedPlant.fact}</p>
                            </div>
                        )}

                        <div className="plant-detail-herbarium">
                            <p className="plant-detail-herbarium-title">🏛️ 官方植物資料庫</p>
                            <p className="plant-detail-herbarium-text">想了解更多權威資訊？可前往香港植物標本室查詢此植物的官方記錄。</p>
                            <a
                                href="https://www.herbarium.gov.hk/tc/hk-plant-database/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="plant-detail-herbarium-link"
                            >
                                🔗 前往香港植物標本室
                            </a>
                        </div>

                        <button
                            onClick={() => {
                                setSelectedPlant(null);
                                setDetailData(null);
                            }}
                            className="plant-detail-close-btn"
                        >
                            關閉
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedPlant && !detailData) {
        return (
            <div className="plant-detail-error">
                <div className="error-container">
                    <div className="error-emoji">😢</div>
                    <h3 className="error-title">無法載入詳細資訊</h3>
                    <p className="error-message">請稍後再試。</p>
                    <button
                        onClick={() => {
                            setSelectedPlant(null);
                            setDetailData(null);
                        }}
                        className="error-close-btn"
                    >
                        關閉
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="pokedex-title">植物圖鑑</h2>
            <div className="pokedex-grid">
                {Object.keys(pokedex).length === 0 ? (
                    <p className="pokedex-empty">
                        還沒有收集到任何植物，快去完成挑戰吧！
                    </p>
                ) : (
                    Object.values(pokedex).map((plant) => (
                        <div
                            key={plant.name}
                            className="pokedex-card"
                            onClick={() => handlePlantClick(plant)}
                        >
                            <img
                                src={plant.image}
                                alt={plant.name}
                            />
                            <p className="plant-name">{plant.name}</p>
                            <p className="plant-type">{plant.type}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}