<template>
  <div class="q-gutter-xl container">
    <div>
      <div class="label text-center">
        Please describe your symptom observation or medical history.
      </div>
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

    <pre id="my-content">My text to annotate.</pre>

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
import { Recogito } from '@recogito/recogito-js';
import '@recogito/recogito-js/dist/recogito.min.css';
import AWS from 'aws-sdk';
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';

const quasar = useQuasar();

var config = new AWS.Config({
  accessKeyId: process.env.AWS_KEY ?? '',
  secretAccessKey: process.env.AWS_SECRET ?? '',
  region: process.env.AWS_REGION ?? '',
});
const comprehendMedical = new AWS.ComprehendMedical(config);

const text = ref<string>('');
const suggestions = ref<string[]>([]);
const isLoading = ref<boolean>(false);
const isMedicalSymptom = ref<boolean>(false);

onMounted(() => {
  const r = new Recogito({
    content: 'my-content',
    locale: 'auto',
    allowEmpty: true,
    widgets: [
      { widget: 'COMMENT' },
      {
        widget: 'TAG',
        vocabulary: ['Place', 'Person', 'Event', 'Organization', 'Animal'],
      },
    ],
    relationVocabulary: ['isRelated', 'isPartOf', 'isSameAs '],
  });
  r.on('createAnnotation', (annotation: any) => {
    console.log('Annotation created:', annotation);
  });
  // r.setMode('RELATIONS');
  r.addAnnotation({
    type: 'Annotation',
    body: [
      {
        type: 'TextualBody',
        value: 'wte',
        purpose: 'commenting',
      },
    ],
    target: {
      selector: [
        {
          type: 'TextQuoteSelector',
          exact: 'home',
        },
        {
          type: 'TextPositionSelector',
          start: 1,
          end: 3,
        },
      ],
    },
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    id: '#ce0ed291-766b-4763-8e91-90ce1d04e706',
  });

  r.addAnnotation({
    type: 'Annotation',
    body: [
      {
        type: 'TextualBody',
        value: 'wte',
        purpose: 'commenting',
      },
    ],
    target: {
      selector: [
        {
          type: 'TextQuoteSelector',
          exact: 'home',
        },
        {
          type: 'TextPositionSelector',
          start: 6,
          end: 14,
        },
      ],
    },
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    id: '#447d4bea-08dc-4bd0-ae51-31f5ed7a95a0',
  });

  r.setMode('RELATIONS');
  r.addAnnotation({
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    type: 'Annotation',
    id: '#4de98f32-2b1b-4214-b1ed-3c2aefed43bb',
    body: [
      {
        type: 'TextualBody',
        value: 'test',
        purpose: 'tagging',
      },
    ],
    target: [
      {
        id: '#447d4bea-08dc-4bd0-ae51-31f5ed7a95a0',
      },
      {
        id: '#ce0ed291-766b-4763-8e91-90ce1d04e706',
      },
    ],
    motivation: 'linking',
  });
});

const onSubmit = async () => {
  try {
    isLoading.value = true;
    const params = {
      Text: 'The patient was prescribed 100mg of Ibuprofen to be taken twice daily.',
    };

    comprehendMedical.detectEntities(params, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log(data);
      }
    });
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
  padding: 12px;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 1.1em;
  margin-bottom: 10px;
}

.userInput {
  align-self: stretch;
  textarea {
    max-width: 500px;
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
