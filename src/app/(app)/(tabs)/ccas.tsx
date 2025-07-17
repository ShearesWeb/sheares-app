import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CCA, CCAType } from '@/types/cca';
import { router } from 'expo-router';
import { CategorizedCCAs, getCategorizedCCAs } from '@/data/services/ccas';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import ErrorScreen from '@/components/Screens/ErrorScreen';

export default function CCAS() {
  const [allCCAs, setAllCCas] = useState<CategorizedCCAs | null>(null)
  const [activeCategory, setActiveCategory] = useState<CCAType>(CCAType.Committee);
  const [activeCCA, setActiveCCA] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function hydrate() {
    try {
      const ccas: CategorizedCCAs = await getCategorizedCCAs();
      setAllCCas(ccas);
      setLoading(false);
    } catch (error) {
      console.error('Error hydrating CCAs:', error);
      setError('Failed to load CCAs. Please try again later.');
      setLoading(false);
      return;
    }
  }

  useEffect(() => {
    hydrate();
  }, []);

  const filteredCCAs = allCCAs?.[activeCategory]?.filter((cca) =>
    cca.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const renderTabBar = () => (
    <View style={styles.tabBarContainer}>
      {[CCAType.Committee, CCAType.Culture, CCAType.Sports, CCAType.JCRC].map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.tabButton,
            activeCategory === category && styles.tabButtonActive,
          ]}
          onPress={() => {
            setActiveCategory(category);
            setSearchQuery('');
          }}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeCategory === category && styles.tabButtonTextActive,
            ]}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: CCA }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.ccaItem,
        activeCCA === item.id && styles.ccaItemActive,
      ]}
      onPress={() => {
        setActiveCCA(item.id)
        router.navigate({
          pathname: '/cca/[id]',
          params: {
            id: item.id
          }
        });
      }}
    >
      <Text
        style={[
          styles.ccaItemText,
          activeCCA === item.id && styles.ccaItemTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ErrorScreen message={error} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {renderTabBar()}
      <TextInput
        style={styles.searchInput}
        placeholder={`Search ${activeCategory}`}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />
      <FlatList
        data={filteredCCAs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? `No results found for "${searchQuery}"` : `No CCAs in ${activeCategory} category`}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  tabButton: {
    paddingVertical: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#EF7C00',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#555',
  },
  tabButtonTextActive: {
    color: '#EF7C00',
    fontWeight: 'bold',
  },

  // Search
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 999,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    paddingLeft: 16,
    fontSize: 16,
    color: '#333',
  },

  // CCA Items
  ccaItem: {
    padding: 20,
    backgroundColor: '#E9E8E4',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  ccaItemActive: {
    backgroundColor: '#EF7C00',
  },
  ccaItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#393939',
  },
  ccaItemTextActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingBottom: 20,
  },

  // Empty state
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});
