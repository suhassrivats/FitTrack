import React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';

const NutritionStatsScreen = () => {
  return (
    <View style={globalStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Nutrition Statistics</Text>
          <View style={[globalStyles.card, globalStyles.alignCenter, globalStyles.gap12]}>
            <Icon name="chart-line" size={48} color={colors.textTertiary} />
            <Text style={globalStyles.emptyStateText}>Nutrition Stats Coming Soon</Text>
            <Text style={globalStyles.emptyStateSubtext}>View detailed nutrition analytics</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NutritionStatsScreen;

