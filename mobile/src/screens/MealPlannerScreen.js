import React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';

const MealPlannerScreen = () => {
  return (
    <View style={globalStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Meal Planner</Text>
          <View style={[globalStyles.card, globalStyles.alignCenter, globalStyles.gap12]}>
            <Icon name="calendar-clock" size={48} color={colors.textTertiary} />
            <Text style={globalStyles.emptyStateText}>Meal Planner Coming Soon</Text>
            <Text style={globalStyles.emptyStateSubtext}>Plan your meals in advance</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MealPlannerScreen;

