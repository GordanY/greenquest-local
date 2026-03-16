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
        return <div className="text-center py-8">加載中</div>;
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
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">🌿</div>
                    <h3 className="text-2xl font-bold mb-2">{selectedPlant.name}</h3>
                    {selectedPlant.scientificName && (
                        <p className="text-sm text-gray-500 italic mb-4">{selectedPlant.scientificName}</p>
                    )}
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">AI 正在生成詳細資訊...</p>
                </div>
            </div>
        );
    }

    if (selectedPlant && detailData) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="text-left max-h-[70vh] overflow-y-auto">
                            <img
                                src={selectedPlant.image}
                                alt={selectedPlant.name}
                                className="w-full max-h-48 object-cover rounded-lg mb-4"
                            />
                            <h3 className="text-2xl font-bold mb-2 text-center">{selectedPlant.name}</h3>
                            {selectedPlant.scientificName && (
                                <p className="text-sm text-gray-500 italic mb-4">{selectedPlant.scientificName}</p>
                            )}

                            <div className="mb-3">
                                <p className="text-sm font-semibold text-emerald-700">植物種類</p>
                                <p className="text-sm text-gray-700">{selectedPlant.type}</p>
                            </div>

                            {detailData.flowerLanguage && (
                                <div className="mb-3">
                                    <p className="text-sm font-semibold text-emerald-700">花語</p>
                                    <p className="text-sm text-gray-700">{detailData.flowerLanguage}</p>
                                </div>
                            )}

                            <div className="mb-3">
                                <p className="text-sm font-semibold text-emerald-700">花期 / 生長季節</p>
                                <p className="text-sm text-gray-700">{detailData.bloomingSeason}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm font-semibold text-emerald-700">簡介</p>
                                <p className="text-sm text-gray-700">{detailData.description}</p>
                            </div>

                            {selectedPlant.fact && (
                                <div className="bg-emerald-50 p-3 rounded-lg mb-4">
                                    <p className="text-xs font-semibold text-emerald-700 mb-1">小知識</p>
                                    <p className="text-xs text-gray-600">{selectedPlant.fact}</p>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                                <p className="text-xs font-semibold text-blue-700 mb-2">🏛️ 官方植物資料庫</p>
                                <p className="text-xs text-gray-600 mb-2">想了解更多權威資訊？可前往香港植物標本室查詢此植物的官方記錄。</p>
                                <a
                                    href="https://www.herbarium.gov.hk/tc/hk-plant-database/index.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                    🔗 前往香港植物標本室
                                </a>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedPlant(null);
                                    setDetailData(null);
                                }}
                                className="btn bg-emerald-500 text-white font-bold py-2 px-6 rounded-full w-full"
                            >
                                關閉
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedPlant && !detailData) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">😢</div>
                    <h3 className="text-2xl font-bold mb-2">無法載入詳細資訊</h3>
                    <p className="text-gray-600 mb-6">請稍後再試。</p>
                    <button
                        onClick={() => {
                            setSelectedPlant(null);
                            setDetailData(null);
                        }}
                        className="btn bg-emerald-500 text-white font-bold py-2 px-6 rounded-full"
                    >
                        關閉
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl sm:text-2xl font-bold text-center text-emerald-700 mb-6">植物圖鑑</h2>
            <div className="pokedex-grid">
                {Object.keys(pokedex).length === 0 ? (
                    <p className="col-span-full text-center text-gray-500">
                        還沒有收集到任何植物，快去完成挑戰吧！
                    </p>
                ) : (
                    Object.values(pokedex).map((plant) => (
                        <div
                            key={plant.name}
                            className="pokedex-card bg-white rounded-lg shadow p-2 text-center cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handlePlantClick(plant)}
                        >
                            <img
                                src={plant.image}
                                alt={plant.name}
                                className="w-full h-20 object-cover rounded-md mb-2"
                            />
                            <p className="text-sm font-bold truncate">{plant.name}</p>
                            <p className="text-xs text-gray-500">{plant.type}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}