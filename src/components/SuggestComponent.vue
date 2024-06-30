<template>
  <div class="q-gutter-xl container">
    <div>
      <div class="label text-center">What symptoms are you experiencing?</div>
      <q-form @submit="onSubmit" class="form q-gutter-md">
        <q-input
          outlined
          v-model="text"
          autogrow
          class="userInput"
          @keydown.enter.prevent="onSubmit"
          :disable="isLoading"
        />
        <q-btn
          label="Get suggestions"
          type="submit"
          rounded
          :loading="isLoading"
        />
      </q-form>
    </div>

    <div v-if="suggestions.length > 0">
      <div v-if="!isMedicalSymptom" class="label text-center suggestionHeading">
        I cannot see symptoms in your description, but here are some suggestions
        anyway:
      </div>
      <div v-else class="label text-center">
        Suggested additional information:
      </div>
      <q-list class="suggestionList">
        <q-item
          v-for="suggestion in suggestions"
          :key="suggestion"
          clickable
          v-ripple
        >
          <q-item-section> • {{ suggestion }}</q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OpenAI from 'openai';
import { useQuasar } from 'quasar';

const quasar = useQuasar();

const openAiConfig = {
  organization: process.env.OPEN_AI_ORG_ID ?? '',
  project: process.env.OPEN_AI_PROJECT_ID ?? '',
  apiKey: process.env.OPEN_AI_API_KEY ?? '',
  dangerouslyAllowBrowser: true,
};

const openAi = new OpenAI(openAiConfig);
const text = ref<string>('');
const suggestions = ref<string[]>([]);
const isLoading = ref<boolean>(false);
const isMedicalSymptom = ref<boolean>(false);

const onSubmit = async () => {
  try {
    isLoading.value = true;
    const completion = await openAi.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `a patient is experiencing the following symptoms: ${text.value}. which additional information could a doctor be interested in? provide a concise list in JSON format, containing exactly two keys: 'suggestions' containing an array of strings that reflect the suggestions and 'isMedicalSymptom' containing a boolean value reflecting whether the given symptom description is describing medical symptoms (true) or is about another topic (false).`,
        },
      ],
      response_format: { type: 'json_object' },
      model: 'gpt-3.5-turbo',
    });
    console.log(completion);

    const suggestionsObj = JSON.parse(
      completion.choices[0].message.content ?? ''
    );
    console.log(suggestionsObj);
    suggestions.value = suggestionsObj.suggestions;
    isMedicalSymptom.value = suggestionsObj.isMedicalSymptom;
  } catch (error) {
    console.error(error);
    quasar.notify({
      message: 'An error occurred',
      caption: `${error}`,
      type: 'negative',
      multiLine: true,
      progress: true,
      actions: [
        {
          label: 'Contact support',
          color: 'white',
          handler: () => {
            window.location.href = 'mailto:bfourdev@gmail.com';
          },
        },
      ],
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style>
.container {
  padding: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.userInput {
  textarea {
    width: 300px;
  }
}

.suggestionHeading {
  max-width: 400px;
}

.suggestionList {
  .q-item {
    border-radius: 22px;
  }
}
</style>