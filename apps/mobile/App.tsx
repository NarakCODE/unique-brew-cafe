import "./global.css";
import { StatusBar } from 'expo-status-bar';
import { 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TextInput,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

const CATEGORIES = [
  { id: '1', name: 'Coffee', active: true },
  { id: '2', name: 'Tea', active: false },
  { id: '3', name: 'Pastries', active: false },
  { id: '4', name: 'Smoothies', active: false },
];

const POPULAR_ITEMS = [
  {
    id: '1',
    name: 'Caramel Macchiato',
    price: '$4.50',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4b?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Vanilla Latte',
    price: '$4.00',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Matcha Frappe',
    price: '$5.50',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Iced Americano',
    price: '$3.50',
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64dbbc?q=80&w=200&auto=format&fit=crop',
  },
];

export default function App() {
  return (
    
    <GluestackUIProvider mode="dark">
      <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-2">
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <View>
            <Text className="text-base text-gray-500 mb-1">Good morning,</Text>
            <Text className="text-2xl font-bold text-gray-800">Coffee Lover ☕️</Text>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop' }} 
            className="w-12 h-12 rounded-full" 
          />
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-12 shadow-sm mb-7 shadow-black/5">
          <Text className="text-lg mr-2">🔍</Text>
          <TextInput 
            className="flex-1 text-base text-gray-800" 
            placeholder="Find your favorite coffee..." 
            placeholderTextColor="#888"
          />
        </View>

        {/* Categories Section */}
        <View className="mb-7">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                className={`px-5 py-2.5 rounded-full mr-3 shadow-sm shadow-black/5 ${
                  cat.active ? 'bg-[#C67C4E]' : 'bg-white'
                }`}
              >
                <Text className={`text-[15px] font-medium ${
                  cat.active ? 'text-white font-semibold' : 'text-gray-500'
                }`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            )
    </GluestackUIProvider>
  )}
          </ScrollView>
        </View>

        {/* Popular Items Grid */}
        <View className="mb-7">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">Popular Now</Text>
            <TouchableOpacity>
              <Text className="text-[#C67C4E] text-sm font-semibold">See all</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {POPULAR_ITEMS.map((item) => (
              <TouchableOpacity key={item.id} className="w-[48%] bg-white rounded-2xl p-2.5 mb-4 shadow-sm shadow-black/5">
                <Image source={{ uri: item.image }} className="w-full h-32 rounded-xl mb-2.5" />
                <View className="px-1">
                  <Text className="text-[15px] font-semibold text-gray-800 mb-1.5">{item.name}</Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-base font-bold text-[#C67C4E]">{item.price}</Text>
                    <Text className="text-xs text-gray-500">⭐ {item.rating}</Text>
                  </View>
                </View>
                <TouchableOpacity className="absolute bottom-0 right-0 bg-[#C67C4E] w-9 h-9 items-center justify-center rounded-tl-xl rounded-br-2xl">
                  <Text className="text-white text-xl font-semibold">+</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Basic Bottom Nav Placeholder */}
      <View className="flex-row justify-around py-4 bg-white border-t border-gray-100">
        <TouchableOpacity className="items-center justify-center"><Text className="text-2xl opacity-100">🏠</Text></TouchableOpacity>
        <TouchableOpacity className="items-center justify-center"><Text className="text-2xl opacity-40">❤️</Text></TouchableOpacity>
        <TouchableOpacity className="items-center justify-center"><Text className="text-2xl opacity-40">🛒</Text></TouchableOpacity>
        <TouchableOpacity className="items-center justify-center"><Text className="text-2xl opacity-40">⚙️</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
