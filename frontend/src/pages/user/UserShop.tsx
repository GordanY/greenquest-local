import { useTable, useReducer, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "../../module_bindings";
import { useState, useEffect } from "react";
import './UserShop.css';

const SHOP_ITEMS = [
    { id: 'special_feed', type: 'consumable', name: '神奇營養液', description: '下次挑戰經驗值加倍！', price: 50, icon: '🧪', levelRequired: 1 },
    { id: 'hat_1', type: 'decoration', name: '時尚草帽', description: '為你的寵物添購一頂可愛的草帽。', price: 150, icon: '👒', levelRequired: 1 },
    { id: 3, type: 'consumable', name: '豐收肥料', description: '立即獲得 100 顆種子！', price: 200, icon: '🌾', levelRequired: 1, disabled: true },
    { id: 4, type: 'decoration', name: '酷炫墨鏡', description: '為你的寵物戴上一副時尚墨鏡。', price: 200, icon: '🕶️', levelRequired: 3, disabled: true },
    { id: 5, type: 'decoration', name: '花紋圍巾', description: '柔軟溫暖的花紋圍巾。', price: 250, icon: '🧣', levelRequired: 3, disabled: true },
    { id: 6, type: 'decoration', name: '植物學家之冠', description: '屬於真正植物學家的榮耀之冠。', price: 500, icon: '👑', levelRequired: 5, disabled: true },
];

export function UserShop(){
    const [my_profile, profile_ready] = useTable(tables.get_user_profile);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [purchaseModal, setPurchaseModal] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const purchaseShopItem = useReducer(reducers.purchaseShopItem);
    const toggleHat = useReducer(reducers.toggleHat);

    useEffect(() => {
        console.log('[Shop] Data updated:', {
            profile_ready,
            my_profile_length: my_profile.length,
            profile_exists: !!profile,
            profile_seeds: profile?.seeds,
            profile_xpBoost: profile?.xpBoostCount
        });
    }, [my_profile, profile_ready]);

    const profile = my_profile[0];
    const userLevel = profile?.petStage || 1;
    const userSeeds = profile?.seeds || 0;
    const hasHat = profile?.hasHat || false;
    const hatEquipped = profile?.hatEquipped || false;
    const xpBoostCount = profile?.xpBoostCount || 0;

    const categories = ['all', 'consumable', 'decoration'];

    const filteredItems = selectedCategory === 'all'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter(item => item.type === selectedCategory);

    const handlePurchase = (item: any) => {
        if (item.disabled) {
            setError('此物品尚未開放');
            return;
        }
        if (userSeeds >= item.price && userLevel >= item.levelRequired) {
            setPurchaseModal(item);
        }
    };

    const confirmPurchase = async () => {
        if (!purchaseModal) return;
        try {
            setError(null);
            console.warn('[Shop] Starting purchase:', purchaseModal.id);
            const result = await purchaseShopItem({ itemId: purchaseModal.id });
            console.warn('[Shop] Purchase completed:', result);
            setPurchaseModal(null);
        } catch (err) {
            console.error('[Shop] Purchase error:', err);
            setError(String(err));
            // Don't close modal on error
        }
    };

    const handleToggleHat = async () => {
        try {
            setError(null);
            console.warn('[Shop] Starting toggle hat');
            const result = await toggleHat({});
            console.warn('[Shop] Toggle hat completed:', result);
        } catch (err) {
            console.error('[Shop] Toggle hat error:', err);
            setError(String(err));
        }
    };

    // Profile required flag gets set to false after mutations, so check data existence instead
    if (!profile) {
        return (
            <div className="shop-loading">
                <div className="loading-spinner"></div>
                <p className="loading-text">加載商店中...</p>
            </div>
        );
    }

    return (
        <div className="shop-container">
            <h1 className="page-title">寵物商店</h1>

            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            <div className="shop-balance">
                <div className="balance-label">你的種子</div>
                <div className="balance-amount">
                    <span>🌿</span>
                    <span>{userSeeds}</span>
                </div>
            </div>

            <div className="shop-categories">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category === 'all' ? '全部' : category === 'consumable' ? '消耗品' : '裝飾品'}
                    </button>
                ))}
            </div>

            <div className="shop-items-list">
                {filteredItems.map(item => {
                    const canAfford = userSeeds >= item.price;
                    const isUnlocked = userLevel >= item.levelRequired;
                    const isAvailable = canAfford && isUnlocked && !item.disabled;

                    // Hat-specific logic
                    const isHatItem = item.id === 'hat_1';
                    const isBoosterItem = item.id === 'special_feed';
                    const hatOwned = isHatItem && hasHat;

                    return (
                        <div key={item.id} className="shop-item">
                            <div className="item-left">
                                <div className="item-icon">{item.icon}</div>
                                <div className="item-info">
                                    <div className="item-name">{item.name}</div>
                                    <p className="item-description">{item.description}</p>
                                    {!isUnlocked && (
                                        <span className="item-level-badge locked">
                                            鎖定 Lv.{item.levelRequired}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="item-right">
                                {isBoosterItem && xpBoostCount > 0 && (
                                    <div className="booster-badge">x{xpBoostCount}</div>
                                )}
                                {!hatOwned ? (
                                    <>
                                        <div className="item-price">
                                            <span className="price-emoji">🌿</span>
                                            <span>{item.price}</span>
                                        </div>
                                        <button
                                            className={`buy-btn ${isAvailable ? 'active' : item.disabled ? 'locked' : isUnlocked ? 'owned' : 'locked'}`}
                                            onClick={() => handlePurchase(item)}
                                            disabled={!isAvailable}
                                        >
                                            {item.disabled ? '敬請期待' : !isUnlocked ? '上鎖' : isAvailable ? '購買' : '不足'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className={`buy-btn equipped ${hatEquipped ? 'active' : 'owned'}`}
                                        onClick={handleToggleHat}
                                    >
                                        {hatEquipped ? '已裝備 ✓' : '已收納'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {purchaseModal && (
                <div className="purchase-modal">
                    <div className="purchase-modal-content">
                        <div className="purchase-emoji">{purchaseModal.icon}</div>
                        <h2 className="purchase-title">確認購買</h2>
                        <p className="purchase-message">
                            確定要購買「{purchaseModal.name}」嗎？
                        </p>
                        <p className="purchase-cost">
                            花費 🌿 {purchaseModal.price}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="purchase-button"
                                onClick={confirmPurchase}
                            >
                                確認
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setPurchaseModal(null)}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}