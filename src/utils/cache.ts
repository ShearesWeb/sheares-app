export enum CacheType {
    String = 'string',
    Hash = 'hash',
    Categorized = 'categorized',
}

type HashCacheValue = {
    type: CacheType.Hash;
    value: Record<string, any>;
    _sortedKeys: string[];
};

type CategorizedCacheValue = {
    type: CacheType.Categorized;
    itemsById: Record<string, any>;
    categories: Record<string, string[]>;
};

type CacheValue =
    | {
        type: CacheType.String;
        value: any;
    }
    | HashCacheValue
    | CategorizedCacheValue;

export class InMemoryCache {
    private store: Map<string, CacheValue> = new Map();

    // ----------------- STRING METHODS -----------------

    set(key: string, value: any) {
        this.store.set(key, { type: CacheType.String, value });
    }

    get<T = any>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry || entry.type !== CacheType.String) return null;
        return entry.value;
    }

    del(key: string) {
        this.store.delete(key);
    }

    has(key: string): boolean {
        return this.store.has(key);
    }

    keys(): string[] {
        return Array.from(this.store.keys());
    }

    clear() {
        this.store.clear();
    }

    // ----------------- HASH METHODS -----------------

    hsetall(key: string, entries: Record<string, any>) {
        const sortedKeys: string[] = Object.keys(entries);
        this.store.set(key, {
            type: CacheType.Hash,
            value: entries,
            _sortedKeys: sortedKeys,
        });
    }

    hset<V = any>(
        key: string,
        field: string,
        value: V,
        sortFn?: (a: V, b: V) => number
    ) {
        const entry = this.store.get(key) as HashCacheValue | undefined;

        if (!entry) {
            this.store.set(key, {
                type: CacheType.Hash,
                value: { [field]: value },
                _sortedKeys: [field],
            });
        } else if (entry.type === CacheType.Hash) {
            const alreadyExists = field in entry.value;
            entry.value[field] = value;

            if (!alreadyExists) {
                entry._sortedKeys.push(field);
            }

            if (sortFn) {
                entry._sortedKeys.sort((a, b) => sortFn(entry.value[a], entry.value[b]));
            }
        } else {
            throw new Error(`Key "${key}" is not a hash`);
        }
    }

    hget<T = any>(key: string, field: string): T | null {
        const entry = this.store.get(key);
        if (!entry || entry.type !== CacheType.Hash) return null;
        return entry.value[field] ?? null;
    }

    hdel(key: string, field: string) {
        const entry = this.store.get(key);
        if (entry?.type === CacheType.Hash) {
            delete entry.value[field];

            const index = entry._sortedKeys.indexOf(field);
            if (index !== -1) {
                entry._sortedKeys.splice(index, 1);
            }
        }
    }

    hgetall<T = any>(key: string): Record<string, T> | null {
        const entry = this.store.get(key);
        if (!entry || entry.type !== CacheType.Hash) return null;
        return entry.value;
    }

    // ------------- Categorized Cache Methods -------------

    /**
     * Sets or updates a single item under a specific category.
     * NOTE: This assumes itemsById holds only relevant category items.
     */
    // ------------- Categorized Cache Methods -------------

    /**
     * Sets or updates a single item under a specific category.
     */
    cSet(key: string, category: string, id: string, value: any) {
        let entry = this.store.get(key) as CategorizedCacheValue | undefined;

        if (!entry) {
            entry = {
                type: CacheType.Categorized,
                itemsById: {},
                categories: {},
            };
            this.store.set(key, entry);
        }

        if (entry.type !== CacheType.Categorized) {
            throw new Error(`Key "${key}" is not a categorized cache`);
        }

        entry.itemsById[id] = value;

        if (!entry.categories[category]) {
            entry.categories[category] = [];
        }

        const list = entry.categories[category];
        if (!list.includes(id)) {
            list.push(id);
        }
    }

    /**
     * Sets a full category of items. Merges into itemsById and replaces the category list.
     */
    cSetCategory(key: string, category: string, valuesById: Record<string, any>) {
        let entry = this.store.get(key) as CategorizedCacheValue | undefined;

        if (!entry) {
            entry = {
                type: CacheType.Categorized,
                itemsById: {},
                categories: {},
            };
            this.store.set(key, entry);
        }

        if (entry.type !== CacheType.Categorized) {
            throw new Error(`Key "${key}" is not a categorized cache`);
        }

        const ids = Object.keys(valuesById);

        for (const id of ids) {
            entry.itemsById[id] = valuesById[id];
        }

        entry.categories[category] = ids;
    }

    /**
     * Retrieves a single item by ID.
     */
    cGet<T = any>(key: string, id: string): T | null {
        const entry = this.store.get(key) as CategorizedCacheValue | undefined;
        if (!entry || entry.type !== CacheType.Categorized) return null;
        return entry.itemsById[id] ?? null;
    }

    /**
     * Retrieves all items under a specific category.
     */
    cGetCategory<T = any>(key: string, category: string): T[] | null {
        const entry = this.store.get(key) as CategorizedCacheValue | undefined;
        if (!entry || entry.type !== CacheType.Categorized) return null;

        const ids = entry.categories[category];
        if (!ids) return null;

        return ids.map((id) => entry.itemsById[id]);
    }

    /**
     * Deletes an item and removes it from all categories.
     */
    cDelete(key: string, id: string) {
        const entry = this.store.get(key) as CategorizedCacheValue;
        if (!entry || entry.type !== CacheType.Categorized) return;

        delete entry.itemsById[id];

        for (const category of Object.keys(entry.categories)) {
            const list = entry.categories[category];
            const index = list.indexOf(id);
            if (index !== -1) {
                list.splice(index, 1);
                if (list.length === 0) {
                    delete entry.categories[category];
                }
            }
        }
    }

}
