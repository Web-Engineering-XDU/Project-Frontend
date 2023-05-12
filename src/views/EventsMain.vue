<template>
    <div class="about">
        <n-h1>Your events</n-h1>
        <n-divider />
        <n-data-table remote ref="table" :columns="columns" :data="data" :loading="loading" :pagination="pagination" :row-props="rowProps" :row-key="rowKey" @update:page="handlePageChange"></n-data-table>
    </div>
</template>
<script setup lang="ts"></script>
<style scoped>
.about {
    padding-top: 20px;
}
</style>