import React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';

const RecipesScreen = () => {
  return (
    <View style={globalStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Recipes</Text>
          <View style={[globalStyles.card, globalStyles.alignCenter, globalStyles.gap12]}>
            <Icon name="book-open-variant" size={48} color={colors.textTertiary} />
            <Text style={globalStyles.emptyStateText}>Recipes Coming Soon</Text>
            <Text style={globalStyles.emptyStateSubtext}>Browse and save your favorite recipes</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipesScreen;

