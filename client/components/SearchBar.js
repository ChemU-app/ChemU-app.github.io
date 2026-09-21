import {View, TextInput, Pressable, StyleSheet} from 'react-native';
import { colors} from '../theme';
import Ionicons from "@react-native-vector-icons/ionicons";


export default function SearchBar({query, setQuery, placeholder}){

	return  <View style={styles.searchBar}>
        <View style={styles.searchPill}>
          <Ionicons name="search-outline" size={16} color={colors.neutral600} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral400}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn} hitSlop={6}>
              <Ionicons name="close" size={11} color={colors.neutral800} />
            </Pressable>
          )}
        </View>
      </View>

}

const styles = StyleSheet.create({
 searchInput: {
    flex: 1, paddingVertical: 11,
    fontFamily: 'Outfit_500Medium', fontSize: 14, color: colors.neutral900,
 },
 clearBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.neutral100, alignItems: 'center', justifyContent: 'center',
 },
 searchBar: { backgroundColor: '#fff', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 },
 searchPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: colors.neutral200,
    borderRadius: 999, paddingHorizontal: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
 },
});
