<template>
  <div class="system_group">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="addGroupData">新建组</el-button>
          <br />
          <el-button
            style="margin-top: 10px;"
            type="primary"
            plain
            :disabled="showMerge"
            @click="handleMergeGroup"
          >合并组</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 列表 -->
    <el-table
      ref="multipleTable"
      :data="groupDataList"
      tooltip-effect="dark"
      v-loading="tableLoding"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="groupName" label="组名" align="center">
        <template v-slot="{row}">
          <span v-if="showName && editNameGroupId === row.groupId">
            <el-input
              ref="nameInput"
              style="width: 10vw;"
              v-model="newGroupName"
              placeholder="请输入"
              clearable
            ></el-input>
          </span>
          <span v-else>{{ row.groupName }}</span>
          <span style="margin-left: 5px;">
            <el-button
              v-if="showName && editNameGroupId === row.groupId"
              size="mini"
              type="text"
              icon="el-icon-check"
              @click="submitNewName(row)"
            >确定</el-button>
            <el-button
              v-else
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="editGroupName(row)"
            >修改</el-button>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="groupOwn" label="组创建人" align="center"></el-table-column>
      <el-table-column label="组成员" align="center">
        <template v-slot="{row}">
          <span
            style="color: #2667ca;cursor: pointer;"
            @click="getMemberListData(row.groupId)"
          >查看组成员</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="{row}">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="deleteGroupData(row.groupId)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增弹层 -->
    <el-dialog
      title="新增组弹层"
      :visible="showAddGroupDialog"
      :before-close="closeAddGroupDialog"
      width="40%"
    >
      <el-form
        :model="addGroupDTO"
        ref="bdmBrand"
        label-width="100px"
        label-position="right"
        class="demo-bdmBrand"
      >
        <el-form-item label="组名称" prop="groupName">
          <el-input v-model="addGroupDTO.groupName" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="组成员" prop="contactPerson">
          <el-cascader
            style="width: 25vw;"
            v-model="selectUserId"
            :options="deptOptions"
            :show-all-levels="false"
            :props="{children: 'children',label: 'deptName', value:'deptId', multiple: true, }"
            clearable
            placeholder="请选择"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeAddGroupDialog()">取 消</el-button>
        <el-button type="primary" @click="submitAddGroupData()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 组员弹层 -->
    <el-dialog title="组成员详情" :visible="showMemberList" @close="closeMemberListDialog" width="40%">
      <el-tag
        :key="tag.userUuid"
        v-for="tag in membersData.fileGroupMember"
        closable
        :disable-transitions="false"
        @close="handleClose(tag)"
      >{{tag.userName}}</el-tag>
      <span v-if="showAddMember">
        <el-cascader
          class="input-new-tag"
          ref="saveTagInput"
          v-model="selectUserId"
          :options="deptOptions"
          :show-all-levels="false"
          :props="{children: 'children',label: 'deptName', value:'deptId', multiple: true, }"
          filterable
          clearable
          placeholder="请选择"
          @keyup.enter.native="submitAddMembers()"
        ></el-cascader>
        <el-button type="primary" @click="submitAddMembers()">确认</el-button>
      </span>
      <el-button v-else class="button-new-tag" size="small" @click="showCascader">+ 组 员</el-button>
    </el-dialog>
  </div>
</template>

<script>
import {
  getGroupList,
  getMemberList,
  addGroup,
  deleteGroup,
  addMember,
  deleteMember,
  mergeGroup,
  renameGroup,
} from '@/api/system/group'
import { department } from '@/api/information/department'
import { getDeptTreeData } from '@/utils/common'
export default {
  name: 'Group',
  data() {
    return {
      // 新增组入参
      addGroupDTO: {
        groupName: '',
        uuid: [],
      },
      // 选中的组ids
      selectGroupId: [],
      // 控制合并组按钮
      showMerge: true,
      // 新组名
      newGroupName: '',
      showName: false,
      // 修改组名的组id
      editNameGroupId: '',

      showAddMember: false,
      // 组成员列表
      membersData: [],
      // 组列表
      groupDataList: [],
      // 列表加载
      tableLoding: false,
      // 控制成员弹层
      showMemberList: false,
      // 控制新增组弹层
      showAddGroupDialog: false,
      // 组织架构数据
      deptOptions: [],
      // 选中的组成员列表
      selectUserId: [],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 列表项选择
    handleSelectionChange(val) {
      this.selectGroupId = []
      if (val.length > 1) {
        this.showMerge = false
        val.forEach((item) => {
          this.selectGroupId.push(item.groupId)
        })
      } else {
        this.showMerge = true
      }
      console.log('val', val)
    },

    // 合并组
    async handleMergeGroup() {
      const res = await mergeGroup({ groupId: this.selectGroupId })
      this.getList()
      this.selectGroupId = []
    },

    // 删除成员
    async handleClose(tag) {
      let uuidList = []
      uuidList.push(tag.userUuid)
      const res = await deleteMember({
        groupId: tag.groupId,
        uuid: uuidList,
      })
      const resMember = await getMemberList({ groupId: tag.groupId })
      this.membersData = resMember.data
    },

    // 修改组名
    editGroupName(row) {
      console.log(row)
      this.showName = true
      this.editNameGroupId = row.groupId
      this.newGroupName = row.groupName
      // 拿数据更新后的dom 获取焦点
      this.$nextTick((_) => {
        // console.log('ref', this.$refs.saveTagInput.$refs.input)
        this.$refs.nameInput.$refs.input.focus()
      })
    },
    async submitNewName(row) {
      console.log('row', row)
      const res = await renameGroup({
        groupId: row.groupId,
        groupName: this.newGroupName,
      })
      this.showName = false
      this.getList()
      this.newGroupName = ''
    },

    // 添加成员
    async submitAddMembers(e) {
      // console.log('e', e)
      // console.log('123', this.selectUserId)

      if (this.selectUserId.length > 0) {
        const uuidList = []
        this.selectUserId.forEach((item) => {
          const one = item[item.length - 1]
          let stringOne = one.toString()
          if (stringOne.length > 10) {
            uuidList.push(one)
          }
        })
        const res = await addMember({
          groupId: this.membersData.groupId,
          uuid: uuidList,
        })
        const memberRes = await getMemberList({
          groupId: this.membersData.groupId,
        })
        this.membersData = memberRes.data
      }
      this.showAddMember = false
      this.selectUserId = []
    },
    showCascader() {
      this.showAddMember = true
      // 拿数据更新后的dom 获取焦点
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 打开组成员弹层
    async getMemberListData(id) {
      const res = await getMemberList({ groupId: id })
      this.membersData = res.data

      this.showMemberList = true
      // 拿部门数据
      this.getDeptTree()
    },

    // 关闭成员弹层
    closeMemberListDialog() {
      this.showMemberList = false
      this.showAddMember = false
      this.getList()
      this.selectUserId = []
    },

    // 删除组
    deleteGroupData(id) {
      this.$to(
        this.$confirm('确定删除组？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteGroup({ groupId: id })
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },

    // 获取数据列表
    async getList() {
      this.tableLoding = true
      const res = await getGroupList()
      this.groupDataList = res.data
      this.tableLoding = false
    },

    // 关闭新增组弹层
    async closeAddGroupDialog() {
      this.showAddGroupDialog = false
      await this.getList()
      this.addGroupDTO.groupName = ''
      this.addGroupDTO.uuid = []
      this.selectUserId = []
    },

    // 获取组织架构数据
    async getDeptTree() {
      const res = await department()
      this.deptOptions = await getDeptTreeData(res.data)
    },

    // 打开新建组弹层
    addGroupData() {
      this.getDeptTree()
      this.showAddGroupDialog = true
    },

    // 提交新增组数据
    async submitAddGroupData() {
      if (this.selectUserId.length < 2) {
        this.$message.warning('新建组至少选择两位成员')
      } else {
        const uuidList = []
        this.selectUserId.forEach((item) => {
          const one = item[item.length - 1]
          let stringOne = one.toString()
          if (stringOne.length > 10) {
            uuidList.push(one)
          }
        })
        this.addGroupDTO.uuid = uuidList
        const res = await addGroup(this.addGroupDTO)
        this.$message({
          type: 'success',
          message: '新增成功！',
        })
        this.closeAddGroupDialog()
      }
      // console.log('新增入参', this.addGroupDTO)
    },
  },
}
</script>

<style lang="scss" scoped>
.system_group {
  padding: 40px;
}
.el-tag + .el-tag {
  margin-left: 10px;
  margin-bottom: 5px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 200px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>